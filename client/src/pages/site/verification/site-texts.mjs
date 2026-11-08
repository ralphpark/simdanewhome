// Run after building cd9f472/current frontend assets with envDir pointing at an empty directory.
// Every API and external request is intercepted. No app server or DB is started.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import ts from 'typescript';
import { openBrowser, sleep, posts, portfolios } from './browser.mjs';
const source = await readFile('client/src/content/siteTexts.ts', 'utf8');
const { siteTexts, siteTextKeys, siteTextPages } = await import('data:text/javascript;base64,' + Buffer.from(ts.transpile(source, {module:ts.ModuleKind.ESNext})).toString('base64'));
const out = '/tmp/simda-text-check';
const report = { comparisons: [], coverage: {}, preload: [], admin: [], exceptions: [] };
const textByVersion = {};
for (const version of ['before', 'after']) {
  let scenario = 'empty';
  let overrides = [{key:'home.hero.title',value:'관리자가 고친 **첫 제목.**',updatedAt:'2026-11-08T00:00:00Z'}];
  const b = await openBrowser({ build: `${out}/${version}-dist`, out, apiFixture: ({path,request}) => {
    let body = [];
    if (path === '/api/site-texts') body = scenario === 'all' ? siteTextKeys.map(key => ({key,value:`⟦${key}⟧`,updatedAt:'2026-11-08T00:00:00Z'})) : scenario === 'admin' ? overrides : [];
    if (path === '/api/site-texts' && scenario === 'failure') return {body:{error:'offline'},status:503};
    if (path === '/api/site-texts' && scenario === 'malformed') body = {invalid:true};
    if (path === '/api/auth/user') body = {id:'offline-admin',email:'admin@example.invalid',role:'admin'};
    if (path === '/api/posts' && scenario === 'all') body = posts;
    if (path === '/api/portfolios' && scenario === 'all') body = portfolios;
    if (request.method === 'POST') body = {id:'offline-success',success:true,...JSON.parse(request.postData)};
    if (request.method === 'PUT') { const key = path.split('/').at(-1); const value = JSON.parse(request.postData).value; overrides = [{key,value,updatedAt:'2026-11-08T00:00:00Z'}]; body = overrides[0]; }
    if (request.method === 'DELETE') { overrides=[]; return {body:[],status:204}; }
    return {body};
  }});
  try {
    textByVersion[version] = {};
    await b.viewport(1440);
    for (const page of siteTextPages) {
      const start = b.report.requests.length;
      await b.nav(page.path); await sleep(page.id === 'home' ? 3000 : 1000);
      console.log(version, page.id);
      const text = await b.ev('document.body.innerText');
      textByVersion[version][page.id] = text;
      await writeFile(join(out,`${version}-${page.id}.txt`),text);
      if (version === 'after') {
        const before = textByVersion.before[page.id];
        report.comparisons.push({page:page.id,equal:before===text,beforeLength:before.length,afterLength:text.length});
        const requests = b.report.requests.slice(start).filter(r=>r.path==='/api/site-texts');
        report.preload.push({page:page.id,requests:requests.length});
      }
      if(page.id==='home') { await b.ev('document.getAnimations().filter(a=>a.animationName==="simda-shimmer").forEach(a=>{a.pause();a.currentTime=4000;})'); await b.shot(`${version}-home-1440`); }
    }
    await b.viewport(390);await b.nav('/');await sleep(3000);await b.ev('document.getAnimations().filter(a=>a.animationName==="simda-shimmer").forEach(a=>{a.pause();a.currentTime=4000;})');await b.shot(`${version}-home-390`);
    if (version === 'before') continue;
    await b.viewport(1440);
    scenario = 'all';
    const covered = new Set();
    const collect = async page => {
      const body = await b.ev('document.body.innerText');
      for (const key of siteTextKeys.filter(key=>siteTexts[key].page===page)) if(body.includes(`⟦${key}⟧`))covered.add(key);
    };
    for (const page of siteTextPages) {
      await b.nav(page.path); await collect(page.id);
      if (page.id === 'home') {
        const top = await b.ev('document.querySelector(".pf-track").getBoundingClientRect().top+scrollY');
        for (const f of [.17,.43,.69,.96]) {await b.scroll(top+(4400-900)*f);await collect(page.id);}
      }
      if (page.id === 'support') {
        for (let i=0;i<8;i++) {await b.click(`#faq-question-${i}`);await collect(page.id);}
      }
      if (page.id === 'portfolio') {
        await b.click('.sp-segments button:nth-of-type(2)'); await collect(page.id);
      }
      if (page.id === 'b2b') {
        for (const [name,value] of [['companyName','검수기업'],['contactName','김검수'],['phone','010-1234-5678'],['email','verify@example.com'],['businessField','식물 공간'],['proposalContent','새로운 사무실 공간의 식물 연출과 유지관리 협업을 제안합니다.']])await b.fill(`[name="${name}"]`,value);
        await b.click('button.c-submit');await b.until('!!document.querySelector("#proposal-success")');await collect(page.id);await b.to('#proposal-success');await b.shot('all-b2b-success');
      }
      if (page.id === 'booking') {
        await b.click('input[value="plant-care"]');await b.click('.c-booking-actions button[type="submit"]');await b.until('!!document.querySelector(".c-calendar")');await collect(page.id);
        const day = await b.ev('[...document.querySelectorAll(".c-calendar button:not([disabled])")].find(b=>/^\\d+$/.test(b.innerText))?.getAttribute("aria-label")');
        assert.ok(day,'available booking date');await b.click(`.c-calendar button[aria-label=${JSON.stringify(day)}]`);await b.click('input[value="10:00"]');await b.click('.c-booking-actions button[type="submit"]');await b.until('!!document.querySelector("input[name=name]")');
        for(const [name,value] of [['name','김검수'],['phone','010-1234-5678'],['email','verify@example.com']])await b.fill(`[name="${name}"]`,value);
        await b.click('.c-booking-actions button[type="submit"]');await b.until('!!document.querySelector(".c-summary")');await collect(page.id);
        await b.click('.c-booking-actions button[type="submit"]');await b.until('!!document.querySelector("#booking-success")');await collect(page.id);await b.to('#booking-success');await b.shot('all-booking-success');
      }
      await b.scroll(900);await collect(page.id);
      report.coverage[page.id] = {total:siteTextKeys.filter(k=>siteTexts[k].page===page.id).length,missing:siteTextKeys.filter(k=>siteTexts[k].page===page.id&&!covered.has(k))};
    }
    // Failure and malformed responses must leave the published defaults visible.
    for (const failure of ['failure','malformed']) {scenario=failure;await b.nav('/');assert.equal(await b.ev('document.body.innerText'),textByVersion.after.home);}
    report.visual = [];
    for (const width of [1440,390]) {
      const before = (await readFile(join(out,`before-home-${width}.png`))).toString('base64');
      const after = (await readFile(join(out,`after-home-${width}.png`))).toString('base64');
      const comparison = await b.ev(`(async () => {
        const load = src => new Promise((resolve,reject) => { const image = new Image(); image.onload=()=>resolve(image); image.onerror=reject; image.src=src; });
        const a=await load('data:image/png;base64,${before}'), c=await load('data:image/png;base64,${after}');
        const canvas=document.createElement('canvas');canvas.width=a.width*2;canvas.height=a.height;
        const ctx=canvas.getContext('2d');ctx.drawImage(a,0,0);ctx.drawImage(c,a.width,0);
        const left=ctx.getImageData(0,0,a.width,a.height).data,right=ctx.getImageData(a.width,0,a.width,a.height).data;
        let differentPixels=0;for(let i=0;i<left.length;i+=4)if(left[i]!==right[i]||left[i+1]!==right[i+1]||left[i+2]!==right[i+2]||left[i+3]!==right[i+3])differentPixels++;
        return {differentPixels,totalPixels:a.width*a.height,image:canvas.toDataURL('image/png').split(',')[1]};
      })()`);
      await writeFile(join(out,`comparison-home-${width}.png`),Buffer.from(comparison.image,'base64'));
      report.visual.push({width,differentPixels:comparison.differentPixels,totalPixels:comparison.totalPixels});
    }
    report.exceptions.push(...b.report.exceptions);
  } catch(error) { report.failure=String(error); report.exceptions.push(...b.report.exceptions); await b.shot('failure'); await writeFile(join(out,'failure-body.txt'),await b.ev('document.body.innerText')); throw error; } finally { await b.close(); await writeFile(join(out,'report.json'),JSON.stringify(report,null,2)); }
}
assert.ok(report.comparisons.every(c=>c.equal),'default body text must match cd9f472 exactly');
assert.ok(Object.values(report.coverage).every(c=>c.missing.length===0),'every key must be visible in its page/state');
assert.ok(report.preload.every(c=>c.requests===1),'preload must reuse the fetch');
assert.equal(report.exceptions.length,0,'no runtime exceptions');
console.log(JSON.stringify(report,null,2));
