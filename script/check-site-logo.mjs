// Needs Vite preview :4173 and an isolated headless Chrome CDP :9229.
// Captures the shipped animation with a controlled test-only RAF clock; no
// production test hooks, credentials, DB writes, or uploads are involved.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const output = 'docs/redesign/verification';
await mkdir(output, { recursive: true });
const source = await readFile('client/src/assets/brand/simda-logo.svg', 'utf8');
const sourceHash = createHash('sha256').update(source).digest('hex');
const expectedPaths = Object.fromEntries(Array.from(source.matchAll(/<g id="([^"]+)">([\s\S]*?)<\/g>/g), ([, id, group]) => [id, Array.from(group.matchAll(/<path d="([^"]+)"/g), ([, d]) => d)]));
const pages = await (await fetch('http://127.0.0.1:9229/json')).json();
const ws = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
let sequence = 0;
const pending = new Map();
const exceptions = [];
ws.onmessage = ({ data }) => {
  const message = JSON.parse(data);
  if (message.id) {
    const task = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) task?.reject(new Error(JSON.stringify(message.error)));
    else task?.resolve(message.result);
  }
  if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.text);
};
function send(method, params = {}) { return new Promise((resolve, reject) => { const id = ++sequence; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); }); }
async function evaluate(expression) {
  if (typeof expression === 'function') expression = `(${expression.toString()})()`;
  const reply = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (reply.exceptionDetails) throw new Error(JSON.stringify(reply.exceptionDetails));
  return reply.result.value;
}
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(expression) {
  for (let i = 0; i < 80; i++) { if (await evaluate(expression)) return; await sleep(75); }
  throw new Error(`Timed out: ${expression}`);
}
async function screenshot(name, full = false) {
  const width = await evaluate('innerWidth');
  const height = full ? Math.ceil((await send('Page.getLayoutMetrics')).cssContentSize.height) : await evaluate('innerHeight');
  const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width, height, scale: 1 } });
  await writeFile(`${output}/${name}.png`, Buffer.from(data, 'base64'));
}
async function verifyPaths(selector) {
  const actual = await evaluate(`Object.fromEntries([...document.querySelector(${JSON.stringify(selector)}).querySelectorAll('[data-logo-part]')].map(group => [group.dataset.logoPart, [...group.querySelectorAll('path')].map(path => path.getAttribute('d'))]))`);
  assert.deepEqual(actual, expectedPaths, `${selector}: contours differ from supplied SVG`);
}
const clockScript = `(() => {
  sessionStorage.removeItem('simda:site-intro-seen');
  const nativeTimeout = window.setTimeout.bind(window);
  const nativeClear = window.clearTimeout.bind(window);
  let now = 1000, sequence = 0;
  const frames = new Map(), timers = new Map();
  Object.defineProperty(performance, 'now', { value: () => now });
  window.requestAnimationFrame = callback => { const id = ++sequence; frames.set(id, callback); return id; };
  window.cancelAnimationFrame = id => frames.delete(id);
  window.setTimeout = (callback, delay, ...args) => {
    if (delay !== 1950) return nativeTimeout(callback, delay, ...args);
    const id = 100000 + ++sequence; timers.set(id, { at: now + delay, callback, args }); return id;
  };
  window.clearTimeout = id => { if (!timers.delete(id)) nativeClear(id); };
  async function frame() {
    const callbacks = [...frames.values()]; frames.clear();
    callbacks.forEach(callback => callback(now));
    for (const [id, timer] of timers) if (timer.at <= now) { timers.delete(id); timer.callback(...timer.args); }
    await new Promise(resolve => nativeTimeout(resolve, 0));
  }
  window.__advanceSimda = async elapsed => {
    await frame();
    while (now < 1000 + elapsed) { now = Math.min(now + 1000 / 60, 1000 + elapsed); await frame(); }
    document.getAnimations().forEach(animation => { animation.pause(); animation.currentTime = elapsed; });
    return now - 1000;
  };
})();`;
const report = { sourceHash, stages: [], navigation: [] };
let injected;
try {
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Network.setBlockedURLs', { urls: ['*cdn.channel.io/*', '*api.channel.io/*'] });
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  injected = (await send('Page.addScriptToEvaluateOnNewDocument', { source: clockScript })).identifier;
  await send('Page.navigate', { url: 'http://127.0.0.1:4173/' });
  await until('!!document.querySelector(".site-loader svg")');
  await evaluate('Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,4000))])');
  for (const elapsed of [300, 800, 1300, 1800]) {
    assert.equal(await evaluate(`window.__advanceSimda(${elapsed})`), elapsed);
    await verifyPaths('.site-loader svg');
    const state = await evaluate(() => {
      const svg = document.querySelector('.site-loader svg').getBoundingClientRect();
      const emblem = document.querySelector('.site-loader [data-logo-part="emblem"]').getBoundingClientRect();
      return {
        opacity: getComputedStyle(document.querySelector('.site-loader')).opacity,
        emblemCenterError: Math.hypot(emblem.x + emblem.width / 2 - (svg.x + (365.050781 - 122) / 255 * svg.width), emblem.y + emblem.height / 2 - (svg.y + (119.144531 - 107) / 87 * svg.height)),
        parts: [...document.querySelectorAll('.site-loader [data-logo-part]')].map(el => ({ part: el.dataset.logoPart, transform: getComputedStyle(el).transform, opacity: getComputedStyle(el).opacity })),
      };
    });
    assert.ok(state.emblemCenterError < 0.1, 'emblem drifts away from its center');
    await screenshot(`loader-${(elapsed / 1000).toFixed(1)}s`);
    if (elapsed === 1300) await screenshot('first-entry-loader');
    report.stages.push({ elapsedMs: elapsed, ...state });
  }
  await evaluate('window.__advanceSimda(1960)');
  assert.equal(await evaluate('!!document.querySelector(".site-loader")'), false);
  await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: injected });
  injected = undefined;
  for (const width of [1440, 390]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: width === 390 ? 844 : 1000, deviceScaleFactor: 1, mobile: width === 390 });
    for (const path of ['/', '/story']) {
      await send('Page.navigate', { url: `http://127.0.0.1:4173${path}` });
      await until('!!document.querySelector("h1")');
      await sleep(1000);
      assert.equal(await evaluate('!!document.querySelector(".site-loader")'), false, 'intro repeats in same session');
      await verifyPaths('.site-nav svg');
      await verifyPaths('footer svg');
      const state = await evaluate(() => {
        const svg = document.querySelector('.site-nav svg');
        const rect = svg.getBoundingClientRect();
        return { viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth, logoWidth: rect.width, logoHeight: rect.height, color: getComputedStyle(svg).color, viewBox: svg.getAttribute('viewBox'), label: svg.getAttribute('aria-label') };
      });
      assert.equal(state.scrollWidth, width);
      assert.equal(state.color, 'rgb(3, 71, 62)');
      assert.equal(state.viewBox, '122 107 255 87');
      assert.equal(state.label, 'simda');
      assert.ok(state.logoHeight < 44);
      await screenshot(`${path === '/' ? 'home' : 'story'}-${width}`, true);
      if (path === '/') await screenshot(`nav-${width}`);
      report.navigation.push({ path, ...state });
    }
    if (width === 390) {
      await evaluate(() => document.querySelector('button[aria-label="메뉴 열기"]').click());
      await until('!!document.querySelector("[role=dialog]")');
      await sleep(700);
      await verifyPaths('[role=dialog] svg');
      await screenshot('mobile-menu');
    }
  }
  // Fresh-session reduced motion: it should not even mount the intro.
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await evaluate('sessionStorage.removeItem("simda:site-intro-seen")');
  await send('Page.navigate', { url: 'http://127.0.0.1:4173/' });
  await until('!!document.querySelector("h1")');
  assert.equal(await evaluate('!!document.querySelector(".site-loader")'), false);
  assert.deepEqual(exceptions, []);
  assert.equal(createHash('sha256').update(await readFile('client/src/assets/brand/simda-logo.svg')).digest('hex'), sourceHash);
  await writeFile(`${output}/logo-report.json`, JSON.stringify({ result: 'PASS', timingMethod: 'Test-only controlled RAF/performance clock; CSS animation currentTime synchronized to requested milliseconds.', ...report, exceptions }, null, 2));
  console.log(JSON.stringify({ result: 'PASS', stages: report.stages, navigation: report.navigation }, null, 2));
} finally {
  if (injected) await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: injected });
  ws.close();
}
