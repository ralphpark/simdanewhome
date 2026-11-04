// Browser-only mock verification. Never sends booking/proposal requests to a backend.
import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
const output = 'docs/redesign/verification/team-c';
await mkdir(output, { recursive: true });
const targets = await (await fetch('http://127.0.0.1:9413/json')).json();
const target = targets.find(t => t.type === 'page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
let id = 0;
const pending = new Map();
const exceptions = [];
const submissions = [];
const resumeForms = process.argv.includes('--forms-only');
const skipLayout = process.argv.includes('--skip-layout');
const bookingOnly = process.argv.includes('--booking-only');
const previous = (resumeForms || skipLayout || bookingOnly) ? JSON.parse(await readFile(`${output}/browser-report.json`, 'utf8')) : {};
const checks = previous.checks ?? [];
const pages = previous.pages ?? [];
let reply = 'success';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
function send(method, params = {}) { return new Promise((resolve, reject) => { const n = ++id; pending.set(n, { resolve, reject }); ws.send(JSON.stringify({ id: n, method, params })); }); }
ws.onmessage = async ({ data }) => {
  const message = JSON.parse(data);
  if (message.id) {
    const task = pending.get(message.id); pending.delete(message.id);
    if (message.error) task?.reject(new Error(JSON.stringify(message.error))); else task?.resolve(message.result);
  }
  if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails);
  if (message.method === 'Fetch.requestPaused') {
    const { requestId, request } = message.params;
    const path = new URL(request.url).pathname;
    if (request.method === 'POST') {
      submissions.push({ path, body: JSON.parse(request.postData), mockReply: reply });
      const mode = reply;
      await sleep(650);
      if (mode === 'network') { await send('Fetch.failRequest', { requestId, errorReason: 'Failed' }); return; }
      await send('Fetch.fulfillRequest', { requestId, responseCode: mode === 'server' ? 500 : 201, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }], body: Buffer.from(JSON.stringify(mode === 'server' ? { error: 'test server error' } : { id: 'team-c-mock', status: 'pending' })).toString('base64') });
    } else {
      await send('Fetch.fulfillRequest', { requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }], body: Buffer.from(JSON.stringify([])).toString('base64') });
    }
  }
};
async function evaluate(expression) {
  const response = await send('Runtime.evaluate', { expression: typeof expression === 'function' ? `(${expression.toString()})()` : expression, returnByValue: true, awaitPromise: true });
  if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails));
  return response.result.value;
}
async function until(expression) {
  for (let i = 0; i < 100; i++) { if (await evaluate(expression)) return; await sleep(100); }
  throw new Error(`Timed out: ${expression}`);
}
async function click(selector) { assert(await evaluate(`!!document.querySelector(${JSON.stringify(selector)})`), `Missing ${selector}`); await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`); await sleep(100); }
async function setValue(name, value) {
  await evaluate(`(() => { const el = document.querySelector('[name="${name}"]'); const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto,'value').set.call(el, ${JSON.stringify(value)}); el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); el.focus(); el.blur(); })()`);
  await sleep(80);
}
async function viewport(width, reduced = false) {
  await send('Emulation.setDeviceMetricsOverride', { width, height: width === 390 ? 844 : 1000, deviceScaleFactor: 1, mobile: width === 390 });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' }] });
}
async function navigate(path) {
  await send('Page.navigate', { url: `http://127.0.0.1:4103${path}` });
  await until(`location.pathname === ${JSON.stringify(path)} && !!document.querySelector('.team-c h1')`);
  await sleep(1000);
  await evaluate('Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,3000))])');
}
async function screenshot(name, full = false) {
  await sleep(900);
  const options = { format: 'png', captureBeyondViewport: full };
  if (full) { const { cssContentSize } = await send('Page.getLayoutMetrics'); options.clip = { x: 0, y: 0, width: await evaluate('innerWidth'), height: Math.ceil(cssContentSize.height), scale: 1 }; }
  const { data } = await send('Page.captureScreenshot', options);
  await writeFile(`${output}/${name}.png`, Buffer.from(data, 'base64'));
}
async function scroll(selector, offset = 130) {
  await evaluate(`window.scrollTo({top: document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect().top + scrollY - ${offset}, behavior: 'instant'})`);
  await sleep(1100);
}
async function checkPage(path, width) {
  const state = await evaluate(`({ width:innerWidth, scrollWidth:document.documentElement.scrollWidth, h1:document.querySelector('.team-c h1').textContent, images:[...document.querySelectorAll('.team-c img')].map(i=>({alt:i.alt,loaded:i.complete&&i.naturalWidth>0})), headings:[...document.querySelectorAll('.team-c h1')].length })`);
  assert.equal(state.scrollWidth, width, `${path} overflow at ${width}`);
  assert.equal(state.headings, 1);
  assert(state.images.every(image => image.alt.length > 0));
  pages.push({ path, ...state });
}
await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
await send('Network.setBlockedURLs', { urls: ['*cdn.channel.io/*', '*api.channel.io/*'] });
await send('Fetch.enable', { patterns: [{ urlPattern: '*/api/*', requestStage: 'Request' }] });
await send('Page.addScriptToEvaluateOnNewDocument', { source: 'sessionStorage.setItem("simda:site-intro-seen","1");' });
try {
  if (!resumeForms && !bookingOnly) {
  if (!skipLayout) {
  for (const width of [1440, 390, 734, 1068]) {
    await viewport(width);
    for (const path of ['/services', '/support', '/support/b2b', '/support/booking']) {
      await navigate(path);
      await checkPage(path, width);
      if (width === 1440 || width === 390) await screenshot(`${path.split('/').pop()}-${width}`);
    }
  }
  checks.push('All four routes: 390 / 734 / 1068 / 1440, no horizontal overflow, one H1, image alt text');
  }
  await viewport(1440); await navigate('/services');
  await scroll('#platform'); await screenshot('services-platform-1440');
  const startScale = await evaluate('getComputedStyle(document.querySelector("#platform img")).transform');
  await evaluate('window.scrollBy(0,400)'); await sleep(600);
  assert.notEqual(await evaluate('getComputedStyle(document.querySelector("#platform img")).transform'), startScale);
  assert.equal(await evaluate('Math.round(document.querySelector(".c-service-nav").getBoundingClientRect().top)'), 44);
  await screenshot('services-platform-scrolled-1440');
  await scroll('#care'); await screenshot('services-care-1440');
  assert.equal(await evaluate('document.querySelector(".c-service-nav [aria-current]").getAttribute("href")'), '#care');
  await click('.c-service-nav a[href="#education"]'); await sleep(1600);
  assert.equal(await evaluate('document.querySelector(".c-service-nav [aria-current]").getAttribute("href")'), '#education');
  await screenshot('services-education-1440');
  assert(await evaluate('[...document.querySelectorAll("#platform .c-button,#sales .c-button")].every(a=>a.href==="https://www.simda.me/"&&a.target==="_blank"&&a.rel.includes("noopener"))'));
  assert(await evaluate(() => !!document.querySelector('.c-ai-card[href="/ai-curation"]')));
  assert.deepEqual(await evaluate(() => [...document.querySelectorAll('.c-service-section')].map(s=>s.id)), ['platform','care','education','landscape','sales']);
  for (const key of ['landscape','sales']) {
    await scroll('#' + key);
    await until(`document.querySelector('#${key} img').complete && document.querySelector('#${key} img').naturalWidth > 0`);
    await screenshot(`services-${key}-1440`);
  }
  assert(await evaluate(() => [...document.querySelectorAll('.c-service-photo img')].every(i=>i.complete && i.naturalWidth > 0)));
  checks.push('Service section order, sticky navigation at 44px, active section, image scale, all 5 images loaded, external CTA and AI route');
  }
  if (!bookingOnly) {
  await viewport(390); await navigate('/services'); await scroll('#care', 110); await screenshot('services-care-390');
  await viewport(1440); await navigate('/support'); await scroll('#faq-title');
  await click('#faq-question-0');
  assert.equal(await evaluate('document.querySelector("#faq-question-0").getAttribute("aria-expanded")'), 'true');
  await evaluate('document.querySelector("#faq-question-0").focus()');
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowDown', code: 'ArrowDown', windowsVirtualKeyCode: 40 });
  assert.equal(await evaluate('document.activeElement.id'), 'faq-question-1');
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r', unmodifiedText: '\r' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
  await until('document.querySelector("#faq-question-1").getAttribute("aria-expanded") === "true"');
  assert.equal(await evaluate('document.querySelector("#faq-answer-0").hidden'), true);
  await screenshot('support-faq-1440');
  checks.push('FAQ click, Enter activation, ArrowDown focus, aria-expanded and hidden panels');
  await viewport(390); await navigate('/support/b2b'); await scroll('#proposal', 70);
  assert.equal(await evaluate('document.querySelector(".team-c").innerText.includes("회사소개서")'), false);
  await click('.c-submit');
  assert((await evaluate('document.querySelectorAll(".c-field-error").length')) >= 5);
  await screenshot('b2b-validation-390');
  await setValue('companyName', '검수용 심다'); await setValue('contactName', '김검수');
  await setValue('phone', 'abcdefghij'); await setValue('email', 'invalid');
  await click('.c-submit');
  assert.equal(submissions.length, 0);
  await setValue('phone', '010-1234-5678'); await setValue('email', 'team-c@example.com');
  await setValue('businessField', '공간 디자인');
  await setValue('proposalContent', '검수용 샘플입니다. 사무실 식물 관리와 워크숍 프로그램 협업을 문의합니다.');
  reply = 'server'; await click('.c-submit');
  assert(await evaluate('!!document.querySelector(".c-submit .site-brand-spinner")'));
  await until('!!document.querySelector(".c-form-error")');
  assert.equal(await evaluate('document.querySelector("[name=companyName]").value'), '검수용 심다');
  await screenshot('b2b-error-390');
  reply = 'success'; await click('.c-submit'); await click('.c-submit');
  await until('!!document.querySelector("#proposal-success")');
  assert.equal(submissions.filter(s=>s.path==='/api/b2b-proposals').length, 2);
  assert.equal(await evaluate('document.activeElement.id'), 'proposal-success');
  await sleep(1000);
  assert((await evaluate('document.querySelector("#proposal-success").getBoundingClientRect().top')) >= 44);
  await scroll('#proposal-success', 100); await screenshot('b2b-success-390');
  checks.push('B2B validation, phone/email errors, spinner, server error retains values, duplicate-click guard, success focus, no download link');
  }
  await viewport(1440); await navigate('/support/booking');
  await click('.c-booking-actions button[type=submit]');
  assert(await evaluate('!!document.querySelector("#type-error")'));
  await click('input[value="plant-care"]'); await click('.c-booking-actions button[type=submit]');
  await until('!!document.querySelector(".c-calendar")');
  await screenshot('booking-date-1440');
  assert.equal(await evaluate('document.querySelectorAll("input[name=preferredTime]").length'), 8);
  assert(await evaluate(() => { const now = new Date(); return [...document.querySelectorAll('.rdp-day')].filter(b => { const m=b.getAttribute('aria-label').match(/(\d+)년 (\d+)월 (\d+)일/); return m && new Date(+m[1], +m[2]-1, +m[3]) <= now; }).every(b=>b.disabled); }));
  const calendar = await evaluate(`(()=>{const days=[...document.querySelectorAll('.rdp-day')];const today=new Date();today.setHours(0,0,0,0);return days.map(b=>({label:b.getAttribute('aria-label'),disabled:b.disabled}));})()`);
  const weekends = calendar.filter(d=>/토요일|일요일/.test(d.label));
  assert(weekends.length >= 8);
  assert(weekends.every(d=>d.disabled));
  await click('.c-booking-actions button[type=submit]');
  assert((await evaluate('document.querySelectorAll(".c-field-error").length')) >= 2);
  if (!await evaluate('!!document.querySelector(".rdp-day:not(:disabled)")')) await click('.rdp-nav_button_next');
  await evaluate(() => document.querySelector('.rdp-day:not(:disabled)').focus());
  const dayBeforeKey = await evaluate('document.activeElement.dataset.date');
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });
  await until(`document.activeElement.dataset.date !== ${JSON.stringify(dayBeforeKey)}`);
  await click('.rdp-day:not(:disabled)'); await click('input[name="preferredTime"][value="14:00"]');
  const selected = await evaluate('document.querySelector(".rdp-day_selected").getAttribute("aria-label")');
  await click('.c-booking-actions button[type=submit]'); await until('!!document.querySelector("[name=name]")');
  await setValue('name', '김검수'); await setValue('phone', '010-9876-5432'); await setValue('email', 'booking@example.com'); await setValue('message', '검수용 샘플: 사무실 식물의 정기 관리를 상담하고 싶습니다.');
  await screenshot('booking-contact-1440');
  await click('.c-back-button'); await until('!!document.querySelector(".c-calendar")');
  assert.equal(await evaluate('document.querySelector(".rdp-day_selected").getAttribute("aria-label")'), selected);
  assert.equal(await evaluate('document.querySelector("input[name=preferredTime]:checked").value'), '14:00');
  await click('.c-booking-actions button[type=submit]'); await until('!!document.querySelector("[name=name]")');
  assert.equal(await evaluate('document.querySelector("[name=name]").value'), '김검수');
  await click('.c-booking-actions button[type=submit]'); await until('!!document.querySelector(".c-summary")');
  await screenshot('booking-confirm-1440');
  reply = 'network'; await click('.c-booking-actions button[type=submit]');
  assert(await evaluate('!!document.querySelector(".site-brand-spinner")'));
  await until('!!document.querySelector(".c-form-error")');
  assert(await evaluate('document.querySelector(".c-summary").textContent.includes("김검수")'));
  await screenshot('booking-network-error-1440');
  reply = 'success'; await click('.c-booking-actions button[type=submit]'); await click('.c-booking-actions button[type=submit]');
  await until('!!document.querySelector("#booking-success")');
  assert.equal(submissions.filter(s=>s.path==='/api/bookings').length, 2);
  const body = submissions.at(-1).body;
  assert.deepEqual(Object.keys(body).sort(), ['name','phone','email','consultationType','preferredDate','preferredTime','message'].sort());
  assert.equal(body.consultationType, 'plant-care'); assert.equal(body.preferredTime,'14:00');
  assert(!Number.isNaN(Date.parse(body.preferredDate)));
  assert.equal(await evaluate('document.activeElement.id'), 'booking-success');
  await sleep(1000);
  assert((await evaluate('document.querySelector("#booking-success").getBoundingClientRect().top')) >= 44);
  await screenshot('booking-success-1440');
  await viewport(390); await screenshot('booking-success-390');
  assert.equal(await evaluate('document.documentElement.scrollWidth'), 390);
  checks.push('Booking: required choices, weekend/date disabled, all 8 time chips, back preserves schedule/contact, summary, network error, spinner, duplicate-click guard, API Date serialization, success focus');
  await viewport(390, true); await navigate('/support/booking');
  await click('input[value="education"]'); await click('.c-booking-actions button[type=submit]');
  await until('!!document.querySelector(".c-calendar")'); await screenshot('booking-calendar-390-reduced');
  await scroll('.c-calendar', 80); await screenshot('booking-calendar-detail-390');
  assert.equal(await evaluate('document.documentElement.scrollWidth'), 390);
  await navigate('/services'); await scroll('#platform');
  assert.equal(await evaluate('getComputedStyle(document.querySelector("#platform img")).transform'), 'none');
  await screenshot('services-reduced-motion-390');
  checks.push('Reduced motion: static service imagery, functional booking transitions and mobile calendar');
  assert.deepEqual(exceptions, []);
  await writeFile(`${output}/browser-report.json`, JSON.stringify({ result: 'PASS', checks: [...new Set(checks)], pages, submissions, exceptions }, null, 2));
  console.log(JSON.stringify({ result: 'PASS', checks, screenshotsDirectory: output }, null, 2));
} catch (error) {
  await screenshot('failure');
  await writeFile(`${output}/browser-report.json`, JSON.stringify({ result: 'FAIL', error: error.stack, checks, pages, submissions, exceptions }, null, 2));
  throw error;
} finally { ws.close(); }
