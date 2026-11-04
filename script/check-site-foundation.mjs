// Run against Vite preview and an isolated headless Chrome (CDP port 9229).
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const output = 'docs/redesign/verification';
await mkdir(output, { recursive: true });
const targets = await (await fetch('http://127.0.0.1:9229/json')).json();
const target = targets.find(t => t.type === 'page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
let id = 0;
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
function send(method, params = {}) { return new Promise((resolve, reject) => { const n = ++id; pending.set(n, { resolve, reject }); ws.send(JSON.stringify({ id: n, method, params })); }); }
async function evaluate(expression) {
  if (typeof expression === 'function') expression = `(${expression.toString()})()`;
  const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails));
  return response.result.value;
}
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(expression) {
  for (let i = 0; i < 60; i++) { if (await evaluate(expression)) return; await sleep(100); }
  throw new Error(`Timed out: ${expression}`);
}
async function navigate(path) {
  await send('Page.navigate', { url: `http://127.0.0.1:4173${path}` });
  await until('!!document.querySelector("h1")');
  await sleep(2100);
}
async function screenshot(name, full = true) {
  const { cssContentSize } = await send('Page.getLayoutMetrics');
  const width = await evaluate('window.innerWidth');
  const height = full ? Math.ceil(cssContentSize.height) : await evaluate('window.innerHeight');
  const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width, height, scale: 1 } });
  await writeFile(`${output}/${name}.png`, Buffer.from(data, 'base64'));
}
await send('Page.enable');
await send('Runtime.enable');
await send('Network.enable');
await send('Network.setBlockedURLs', { urls: ['*cdn.channel.io/*', '*api.channel.io/*'] });
const report = [];
try {
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  for (const width of [1440, 390]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: width === 390 ? 844 : 1000, deviceScaleFactor: 1, mobile: width === 390 });
    for (const path of ['/', '/story']) {
      await navigate(path);
      await evaluate('Promise.race([document.fonts.ready, new Promise(resolve=>setTimeout(resolve,4000))])');
      const state = await evaluate(`({path:location.pathname,title:document.querySelector('h1').innerText,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,navHeight:document.querySelector('header').getBoundingClientRect().height,font:getComputedStyle(document.querySelector('#site-main')).fontFamily,imageLoaded:[...document.querySelectorAll('#site-main img')].map(i=>({src:i.currentSrc,loaded:i.complete&&i.naturalWidth>0})),loader:!!document.querySelector('.site-loader')})`);
      assert.equal(state.scrollWidth, width, 'horizontal overflow');
      assert.equal(state.navHeight, 48);
      assert.equal(state.loader, false);
      await screenshot(`${path === '/' ? 'home' : 'story'}-${width}`);
      report.push(state);
    }
    if (width === 390) {
      await evaluate(() => document.querySelector('button[aria-label="메뉴 열기"]').click());
      await until('!!document.querySelector("[role=dialog]")');
      await sleep(700);
      assert.equal(await evaluate('document.querySelector("[role=dialog]").getBoundingClientRect().width'), 390);
      await screenshot('mobile-menu', false);
      for (let i = 0; i < 14; i++) {
        await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
        await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
        assert.equal(await evaluate('document.querySelector("[role=dialog]").contains(document.activeElement)'), true, 'menu focus trap');
      }
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await sleep(400);
      assert.equal(await evaluate('!!document.querySelector("[role=dialog]")'), false);
    }
  }
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await navigate('/');
  await evaluate('window.scrollTo(0, 600)');
  await sleep(500);
  assert.equal(await evaluate('document.querySelector("header").getBoundingClientRect().height'), 44);
  await screenshot('home-scrolled-1440', false);
  await evaluate(() => document.querySelector('header a[href="/story"]').click());
  await sleep(600);
  assert.equal(await evaluate('location.pathname'), '/story');
  assert.equal(await evaluate('window.scrollY'), 0);
  assert.equal(await evaluate('!!document.querySelector(".site-loader")'), false);
  assert.equal(await evaluate('document.activeElement.id'), 'site-main');
  await evaluate(() => document.querySelector('button[aria-label="고객센터 하위 메뉴"]').click());
  await sleep(300);
  assert.equal(await evaluate(() => !!document.querySelector('nav[aria-label="고객센터 하위 메뉴"] a[href="/support/b2b"]')), true);
  for (const [from, to] of [['/about', '/story'], ['/b2b', '/support/b2b'], ['/booking', '/support/booking']]) {
    await navigate(from);
    assert.equal(await evaluate('location.pathname'), to);
  }
  for (const path of ['/services', '/portfolio', '/portfolio/test-id', '/magazine', '/magazine/test-id', '/support', '/support/b2b', '/support/booking']) {
    await navigate(path);
    assert.equal(await evaluate('document.querySelectorAll(".site-nav").length'), 1);
    assert.equal(await evaluate('document.querySelectorAll("main").length'), 1);
  }
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await evaluate('sessionStorage.removeItem("simda:site-intro-seen")');
  await navigate('/');
  assert.equal(await evaluate('!!document.querySelector(".site-loader")'), false);
  assert.equal(await evaluate('document.documentElement.classList.contains("lenis")'), false);
  assert.equal(await evaluate('getComputedStyle(document.querySelector("h1").parentElement).opacity'), '1');
  await screenshot('home-reduced-motion-1440');
  assert.deepEqual(exceptions, []);
  await writeFile(`${output}/browser-report.json`, JSON.stringify({ checks: 'PASS: routes, redirects, desktop/mobile overflow, navigation, scroll reset, focus trap, reduced motion, no JS exceptions', screenshots: 7, pages: report }, null, 2));
  console.log(JSON.stringify({ result: 'PASS', pages: report, exceptions }, null, 2));
} finally { ws.close(); }
