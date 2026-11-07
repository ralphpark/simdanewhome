// Isolated Chrome + browser-only fixtures; never starts the API or loads secrets.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { defaultImages } from '../../../content/images.ts';
import { projects } from '../../../content/brand.ts';

const output = 'docs/redesign/verification/team-a';
const focusOnly = process.argv.includes('--focus');
const widths = focusOnly ? [] : process.argv.includes('--mobile') ? [390] : [1440, 390, 734, 1068];
const reportName = focusOnly ? 'focus-report.json' : process.argv.includes('--mobile') ? 'mobile-browser-report.json' : 'browser-report.json';
await mkdir(output, { recursive: true });
const profile = await mkdtemp(join(tmpdir(), 'simda-team-a-chrome-'));
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-component-update', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let ws;
const report = { checks: [], pages: [], motion: [], exceptions: [], fixture: 'API requests intercepted only in an isolated verification browser. Not live DB data.' };
try {
  let port;
  for (let attempt = 0; attempt < 80; attempt++) {
    try { port = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break; } catch { await sleep(100); }
  }
  assert.ok(port, 'Chrome started');
  const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  ws = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let id = 0;
  let scenario = 'populated';
  const pending = new Map();
  const portfolioFixtures = [0, 1, 2, 3].map((index) => ({
    id: `verify-work-${index}`, title: projects[index].title, description: projects[index].title,
    category: projects[index].category, featured: index === 1 || index === 3, clientName: null,
    thumbnailUrl: defaultImages[['portfolio.hero', 'services.landscape', 'home.hero', 'services.care'][index]].url,
    images: [], completedDate: `2026-0${8 - index}-01`, createdAt: `2026-0${8 - index}-01`, updatedAt: '2026-11-01',
  }));
  const postFixtures = [
    { id: 'verify-post-old', title: '식물과 함께하는 일상', published: true, publishedAt: '2026-08-01', category: '식물 이야기', thumbnailUrl: defaultImages['magazine.hero'].url },
    { id: 'verify-post-new', title: '공간의 결에 맞는 식물', published: true, publishedAt: '2026-10-30', category: '공간 이야기', thumbnailUrl: defaultImages['services.care'].url },
    { id: 'verify-post-middle', title: '처음의 마음으로 가꾸는 정원', published: true, publishedAt: '2026-09-01', category: '정원 이야기', thumbnailUrl: defaultImages['story.philosophy'].url },
    { id: 'verify-post-draft', title: '비공개 글', published: false, publishedAt: '2026-11-01', category: '비공개' },
    { id: 'verify-post-future', title: '예약된 미래 글', published: true, publishedAt: '2099-01-01', category: '예약' },
  ].map(post => ({ ...post, excerpt: '식물을 고르고, 가꾸고, 전하는 심다의 이야기입니다.', createdAt: post.publishedAt, content: '', tags: [], author: 'simda', viewCount: 0 }));
  function send(method, params = {}) { return new Promise((resolve, reject) => { const n = ++id; pending.set(n, { resolve, reject }); ws.send(JSON.stringify({ id: n, method, params })); }); }
  ws.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) { const task = pending.get(message.id); pending.delete(message.id); if (message.error) task?.reject(new Error(JSON.stringify(message.error))); else task?.resolve(message.result); }
    if (message.method === 'Runtime.exceptionThrown') report.exceptions.push(message.params.exceptionDetails);
    if (message.method === 'Fetch.requestPaused') {
      const { requestId, request } = message.params;
      const path = new URL(request.url).pathname;
      let body = [];
      if (scenario === 'populated' || scenario === 'override') {
        if (path === '/api/portfolios') body = portfolioFixtures;
        if (path === '/api/posts') body = postFixtures;
      }
      if (scenario === 'override' && path === '/api/site-images') body = [{ key: 'home.hero', url: 'https://images.unsplash.com/photo-1547936785-c57315d64694?auto=format&fit=crop&w=2400&q=80', alt: '검수용 관리자 교체 이미지', updatedAt: '2026-11-04' }];
      const fail = scenario === 'error' && path !== '/api/site-images';
      send('Fetch.fulfillRequest', { requestId, responseCode: fail ? 503 : 200, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }], body: Buffer.from(JSON.stringify(fail ? { error: 'verification failure' } : body)).toString('base64') }).catch(error => report.exceptions.push(String(error)));
    }
  };
  async function evaluate(expression) {
    if (typeof expression === 'function') expression = `(${expression.toString()})()`;
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  }
  async function until(expression) { for (let i = 0; i < 100; i++) { if (await evaluate(expression)) return; await sleep(100); } throw new Error(`Timeout: ${expression}`); }
  async function navigate(path) {
    await send('Page.navigate', { url: `http://127.0.0.1:4101${path}` });
    await until('!!document.querySelector(".a-home, .a-story")');
    await sleep(2200);
    await evaluate('Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,3000))])');
  }
  async function scrollTo(y) { await evaluate(`window.scrollTo({top:${y},behavior:'instant'})`); await sleep(1000); }
  async function at(selector, offset = 70) { const top = await evaluate(`document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect().top+scrollY`); await scrollTo(top - offset); }
  async function shot(name, full = false) {
    const width = await evaluate('innerWidth');
    const height = full ? Math.ceil((await send('Page.getLayoutMetrics')).cssContentSize.height) : await evaluate('innerHeight');
    // Native viewport capture avoids CDP shifting fixed layers during mobile clips.
    const { data } = await send('Page.captureScreenshot', full ? { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width, height, scale: 1 } } : { format: 'png', captureBeyondViewport: false });
    await writeFile(`${output}/${name}.png`, Buffer.from(data, 'base64'));
  }
  async function noOverflow(label) {
    const state = await evaluate('({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,scrollY})');
    assert.equal(state.scrollWidth, state.width, `horizontal overflow: ${label}`);
    return state;
  }
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
  await send('Network.setBlockedURLs', { urls: ['*cdn.channel.io/*', '*api.channel.io/*'] });
  await send('Fetch.enable', { patterns: [{ urlPattern: '*127.0.0.1:4101/api/*' }] });
  await send('Page.addScriptToEvaluateOnNewDocument', { source: "sessionStorage.setItem('simda:site-intro-seen','1')" });
  if (focusOnly) {
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
    await navigate('/');
    await scrollTo(600);
    await evaluate(() => document.querySelector('.a-home-hero-copy a').focus({ preventScroll: true }));
    assert.equal(await evaluate('getComputedStyle(document.querySelector(".a-home-hero-copy")).opacity'), '1');
    assert.equal(await evaluate('getComputedStyle(document.activeElement).outlineWidth'), '3px');
    await shot('home-1440-keyboard-hero');
    const top = await evaluate('document.querySelector(".a-home-work-stack").getBoundingClientRect().top+scrollY');
    await scrollTo(top + 956);
    await evaluate(() => document.querySelector('.a-home-project a').focus({ preventScroll: true }));
    const visible = await evaluate(() => { const link=document.activeElement; const box=link.getBoundingClientRect(); return link.contains(document.elementFromPoint(box.x+box.width/2,box.y+box.height/2)); });
    assert.equal(visible, true, 'focused project link must not be covered by the next sticky slide');
    await shot('home-1440-keyboard-project');
    report.checks.push('Keyboard focus makes faded hero link visible with a 3px outline; focused project link is not occluded by the next sticky slide');
  }
  for (const width of widths) {
    const height = width === 390 ? 844 : 1000;
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width === 390 });
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
    for (const path of ['/', '/story']) {
      await navigate(path);
      const pageName = path === '/' ? 'home' : 'story';
      await shot(`${pageName}-${width}-opening`);
      assert.equal(await evaluate('document.querySelectorAll("#site-main h1").length'), 1);
      report.pages.push({ path, ...await noOverflow(`${pageName}-${width}`) });
      if (path === '/') {
        assert.deepEqual(await evaluate('[...document.querySelectorAll(".a-home-project-copy a")].map(a=>a.getAttribute("href"))'), ['/portfolio/verify-work-1', '/portfolio/verify-work-3', '/portfolio/verify-work-0']);
        assert.deepEqual(await evaluate('[...document.querySelectorAll(".a-home-post")].map(a=>a.getAttribute("href"))'), ['/magazine/verify-post-new', '/magazine/verify-post-middle', '/magazine/verify-post-old']);
        await scrollTo(height * 0.35); await shot(`home-${width}-hero-scaled`);
        report.motion.push({ width, hero: await evaluate('({transform:getComputedStyle(document.querySelector(".a-home-hero-frame")).transform,radius:getComputedStyle(document.querySelector(".a-home-hero-frame")).borderRadius,copyOpacity:getComputedStyle(document.querySelector(".a-home-hero-copy")).opacity})') });
        const numbersTop = await evaluate('document.querySelector(".a-home-numbers").offsetTop');
        for (const progress of [0.1, 0.5, 0.95]) {
          await scrollTo(numbersTop + height * 1.6 * progress); await sleep(1000);
          if (width === 1440 || width === 390) await shot(`home-${width}-numbers-${progress}`);
        }
        assert.equal(await evaluate('document.querySelectorAll(".a-home-stat[data-revealed=true]").length'), 5);
        for (const selector of ['.a-home-platform', '.a-home-services', '.a-home-work-stack', '.a-home-magazine', '.a-home-closing']) {
          await at(selector); await noOverflow(`${selector}-${width}`);
          if (width === 1440 || width === 390) await shot(`home-${width}-${selector.slice(8)}`);
        }
        if (width === 1440 || width === 390) {
          const workTop = await evaluate('document.querySelector(".a-home-work-stack").getBoundingClientRect().top+scrollY');
          for (const step of [1, 2]) { await scrollTo(workTop + (height - 44) * step); await shot(`home-${width}-work-${step + 1}`); }
          await at('.a-home-clients'); await shot(`home-${width}-clients`);
        }
        await at('.a-home-services');
        await evaluate(() => document.querySelector('button[aria-label="다음 서비스"]').click()); await sleep(1000);
        assert.ok(await evaluate('document.querySelector("#home-service-rail").scrollLeft>0'));
        await evaluate('document.querySelector("#home-service-rail").scrollTo({left:10000,behavior:"instant"})'); await sleep(300);
        assert.equal(await evaluate(() => document.querySelector('button[aria-label="다음 서비스"]').disabled), true);
        await evaluate(() => document.querySelector('button[aria-label="이전 서비스"]').click()); await sleep(1000);
        assert.equal(await evaluate(() => document.querySelector('button[aria-label="다음 서비스"]').disabled), false);
        assert.deepEqual(await evaluate('[...document.querySelectorAll(".a-home-service-tile")].map(a=>a.getAttribute("href"))'), ['/services#care','/services#education','/services#landscape','/services#sales']);
        await evaluate('document.querySelector(".a-home-marquee-control").click()');
        assert.equal(await evaluate('getComputedStyle(document.querySelector(".a-home-marquee-track")).animationPlayState'), 'paused');
      } else {
        const start = await evaluate('document.querySelector(".a-story-philosophy").offsetTop');
        for (const progress of [0.05, 0.5, 0.95]) {
          await scrollTo(start + height * 1.4 * progress);
          if (width === 1440 || width === 390) await shot(`story-${width}-philosophy-${progress}`);
          report.motion.push({ width, philosophyProgress: progress, litWords: await evaluate('[...document.querySelectorAll(".a-story-word-lit")].filter(e=>Number(getComputedStyle(e).opacity)>.9).length') });
        }
        assert.ok((await evaluate('[...document.querySelectorAll(".a-story-word-lit")].every(e=>Number(getComputedStyle(e).opacity)>.95)')));
        for (const year of [2016, 2023, 2026]) {
          await at(`[data-story-year="${year}"]`, height * 0.3);
          if (width >= 734) assert.equal(await evaluate('document.querySelector(".a-story-active-year").textContent'), String(year));
          if (width === 1440 || width === 390) await shot(`story-${width}-timeline-${year}`);
        }
        for (const selector of ['.a-story-recognition', '.a-story-media', '.a-story-closing']) {
          await at(selector); await noOverflow(`${selector}-${width}`);
          if (width === 1440 || width === 390) await shot(`story-${width}-${selector.slice(9)}`);
        }
      }
      // Visit every image before testing lazy-load success.
      const imagePositions = await evaluate('[...document.querySelectorAll("#site-main img")].map(i=>Math.max(0,i.getBoundingClientRect().top+scrollY-200))');
      for (const top of imagePositions) await scrollTo(top);
      await sleep(1200);
      const images = await evaluate('[...document.querySelectorAll("#site-main img")].map(i=>({src:i.currentSrc,alt:i.alt,loaded:i.complete&&i.naturalWidth>0}))');
      report.pages.at(-1).images = images;
      assert.ok(images.every(image => image.loaded), `images loaded: ${pageName}-${width}`);
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
      await navigate(path);
      await evaluate('document.querySelectorAll("#site-main img").forEach(img=>img.loading="eager")'); await sleep(1800);
      await noOverflow(`reduced-${pageName}-${width}`);
      if (path === '/') {
        assert.equal(await evaluate('getComputedStyle(document.querySelector(".a-home-numbers-sticky")).position'), 'static');
        assert.equal(await evaluate('getComputedStyle(document.querySelector(".a-home-marquee-track")).animationName'), 'none');
      } else assert.equal(await evaluate('getComputedStyle(document.querySelector(".a-story-philosophy-sticky")).position'), 'static');
      if (width === 1440 || width === 390) await shot(`${pageName}-${width}-reduced-full`, true);
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
    }
    console.log(`PASS ${width}px: home/story, overflow, motion, carousel, content, image load, reduced motion`);
  }
  if (widths.length) report.checks.push(`${widths.join('/')}: no horizontal overflow, one h1, all images loaded`, 'Featured-first portfolio ordering; latest three published posts; drafts/future posts excluded', 'Hero transform/radius/copy fade; sequential stats; word reveal; sticky year changes', 'Carousel next/previous/end states and service hash destinations', 'Marquee pause; reduced-motion static layout');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  for (scenario of ['empty','error','override']) {
    await navigate('/');
    if (scenario === 'empty') { assert.equal(await evaluate('document.querySelectorAll(".a-home-project-fallback").length'), 1); assert.equal(await evaluate('document.querySelectorAll(".a-home-post").length'), 0); await at('.a-home-magazine'); }
    if (scenario === 'error') { assert.ok(await evaluate('document.querySelector(".a-home-empty").textContent.includes("불러오지 못했습니다")')); await at('.a-home-magazine'); }
    if (scenario === 'override') assert.equal(await evaluate('document.querySelector(".a-home-hero img").getAttribute("alt")'), '검수용 관리자 교체 이미지');
    await shot(`home-390-${scenario}`);
  }
  scenario = 'populated';
  await evaluate(() => document.querySelector('header a[href="/story"]')?.click());
  await sleep(700);
  assert.equal(await evaluate('location.pathname'), '/story');
  assert.equal(await evaluate('scrollY'), 0);
  report.checks.push('Empty/error API states, admin image override, client-side story navigation and scroll reset');
  assert.deepEqual(report.exceptions, []);
  report.result = 'PASS';
} catch (error) {
  report.result = 'FAIL'; report.failure = error.stack; console.error(error); process.exitCode = 1;
} finally {
  await writeFile(`${output}/${reportName}`, JSON.stringify(report, null, 2));
  ws?.close(); chrome.kill('SIGTERM');
}
