// Frontend-only verification. Serves built assets + the supplied reference, and
// intercepts every external/API request inside a disposable Chrome profile.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join, extname } from 'node:path';
const out = resolve('docs/redesign/verification/home-v2');
const build = '/tmp/simda-home-v2-dist';
const reference = resolve('docs/redesign/verification/motion/index.html');
const quick = process.argv.includes('--quick');
const edgeOnly = process.argv.includes('--edges');
const report = { fixture: 'Offline browser fixtures; no API server, environment files, or external network.', checks: [], comparisons: [], pages: [], exceptions: [] };
const sleep = ms => new Promise(r => setTimeout(r, ms));
await mkdir(out, { recursive: true });
const server = createServer(async (req, res) => {
  try {
    const path = new URL(req.url, 'http://localhost').pathname;
    const file = path === '/reference.html' ? reference : extname(path) ? resolve(build, '.' + path) : join(build, 'index.html');
    if (file !== reference && !file.startsWith(build + '/')) { res.writeHead(403).end(); return; }
    const data = await readFile(file);
    const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.jpg':'image/jpeg', '.png':'image/png', '.svg':'image/svg+xml' };
    res.writeHead(200, { 'Content-Type':mime[extname(file)] || 'application/octet-stream' }); res.end(data);
  } catch { res.writeHead(404).end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;
const profile = await mkdtemp(join(tmpdir(), 'simda-home-v2-chrome-'));
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new','--hide-scrollbars','--no-first-run','--no-default-browser-check','--disable-background-networking','--disable-component-update','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'], { stdio:'ignore' });
let ws;
try {
  let port;
  for (let i=0;i<80;i++) { try { port=(await readFile(join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]; break; } catch { await sleep(100); } }
  assert.ok(port,'Chrome starts');
  const targets=await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
  await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
  let id=0, scenario='empty'; const pending=new Map();
  const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});
  const portfolioFixtures=[0,1,2,3].map(i=>({id:`verify-work-${i}`,title:['캘러웨이 코리아','헤이즈밀 베이커리','오페라박물관','정원'][i],description:'검수용 프로젝트',category:'landscape',featured:i===1||i===3,thumbnailUrl:`/images/home/work${i%3+1}.jpg`,images:[],completedDate:`2026-0${8-i}-01`}));
  const postFixtures=[{id:'old',published:true,publishedAt:'2025-08-01'},{id:'new',published:true,publishedAt:'2026-10-01'},{id:'middle',published:true,publishedAt:'2026-09-01'},{id:'draft',published:false,publishedAt:'2026-11-01'},{id:'future',published:true,publishedAt:'2099-01-01'}].map(p=>({...p,title:`식물 이야기 ${p.id}`,category:'가이드',excerpt:'식물과 함께하는 일상',thumbnailUrl:'/images/home/plant-pot.jpg',createdAt:p.publishedAt}));
  ws.onmessage=async ({data})=>{
    const m=JSON.parse(data);
    if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p?.reject(new Error(JSON.stringify(m.error))):p?.resolve(m.result);}
    if(m.method==='Runtime.exceptionThrown') report.exceptions.push(m.params.exceptionDetails);
    if(m.method==='Fetch.requestPaused') {
      const {requestId,request,resourceType}=m.params;const url=new URL(request.url);
      try {
        if(url.pathname.startsWith('/api/')) {
          let body=[];
          if(scenario==='populated' && url.pathname==='/api/portfolios')body=portfolioFixtures;
          if(scenario==='populated' && url.pathname==='/api/posts')body=postFixtures;
          if(scenario==='override' && url.pathname==='/api/site-images')body=['hero','care','education','landscape','sales','story','platform','gift','work2','work3'].map(key=>({key:`home.${key}`,url:`https://verify.invalid/${key}.jpg`,alt:`교체 ${key}`}));
          await send('Fetch.fulfillRequest',{requestId,responseCode:scenario==='error'?503:200,responseHeaders:[{name:'Content-Type',value:'application/json'}],body:Buffer.from(JSON.stringify(body)).toString('base64')});
        } else if(url.origin!==origin && !['data:','blob:'].includes(url.protocol)) {
          if(resourceType==='Image')await send('Fetch.fulfillRequest',{requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'image/jpeg'}],body:(await readFile(join(build,'images/home/hero.jpg'))).toString('base64')});
          else await send('Fetch.failRequest',{requestId,errorReason:'BlockedByClient'});
        } else await send('Fetch.continueRequest',{requestId});
      }catch(e){report.exceptions.push(String(e));}
    }
  };
  async function ev(expression){const r=await send('Runtime.evaluate',{expression:typeof expression==='function'?`(${expression.toString()})()`:expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
  async function until(expression){for(let i=0;i<100;i++){if(await ev(expression))return;await sleep(80);}throw new Error(`Timeout: ${expression}`);}
  async function nav(path){await send('Page.navigate',{url:origin+path});await until(path==='/reference.html'?'!!document.querySelector(".pg")':'!!document.querySelector("#site-main h1")');await sleep(3300);await ev('document.fonts.ready');}
  async function scroll(y){await ev(`window.scrollTo({top:${y},behavior:'instant'})`);await sleep(220);}
  async function shot(name){const {data}=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(join(out,name+'.png'),Buffer.from(data,'base64'));}
  async function motionState(){return ev(()=>Object.fromEntries(['.hm','.hc','.hl-row','.hl-dots-in b','.cnt','.pf-caps .c1','.pf-caps .c2','.pf-caps .c3','.pf-caps .c4','.s1','.s2','.s3','.s4','.pf-bar span','.wi','.pass','.t-h2'].map(s=>{const c=getComputedStyle(document.querySelector(s));return [s,{opacity:c.opacity,transform:c.transform,clip:c.clipPath,animation:c.animationName,timeline:c.animationTimeline,number:c.getPropertyValue('--n'),letterSpacing:c.letterSpacing}]})));}
  async function geometry(){return ev(()=>Object.fromEntries(['.hero-track','.hl-track','.story','.imm-track','.facts','.pf-track','.wk','.mag','.ways','.sig','.ft','.hc .t-hero','.hm','.gn'].map(s=>{const e=document.querySelector(s),r=e.getBoundingClientRect(),c=getComputedStyle(e);return [s,{top:r.top+scrollY,left:r.left,width:r.width,height:r.height,font:c.fontSize,background:c.backgroundColor}]})));}
  async function overflow(label){const state=await ev('({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,scrollY})');assert.ok(state.scrollWidth<=state.width,label+' overflow');return state;}
  await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Fetch.enable',{patterns:[{urlPattern:'*'}]});
  const introScript = await send('Page.addScriptToEvaluateOnNewDocument',{source:"if(location.pathname!=='/loader-check')sessionStorage.setItem('simda:site-intro-seen','1')"});
  for(const width of edgeOnly ? [] : [1440,390]){
    const height=width===1440?900:844;
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width===390});
    await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
    scenario='empty';await nav('/');const app=await geometry();await overflow('home '+width);
    const ranges=[['opening',0],['hero-middle',350],['hero-end',1050],['highlight',app['.hl-track'].top+1300],['story',app['.imm-track'].top+720],['numbers',app['.facts'].top-100],...([.17,.43,.69,.96].map((f,i)=>['platform-'+(i+1),app['.pf-track'].top+(4400-height)*f])),['portfolio',app['.wk'].top+200],['magazine',app['.mag'].top+60],['signature',app['.sig'].top-240],['footer',app['.ft'].top]];
    const motion = { app: {}, reference: {} };
    for(const [name,y] of quick?ranges.slice(0,3):ranges){await scroll(y);motion.app[name]=await motionState();await shot(`home-${width}-${name}`);assert.equal(await ev('Math.round(document.querySelector(".gn").getBoundingClientRect().top)'),0,'sticky header');}
    await nav('/reference.html');const ref=await geometry();
    for(const [name,y] of quick?ranges.slice(0,3):ranges){await scroll(y);motion.reference[name]=await motionState();await shot(`reference-${width}-${name}`);}
    report.comparisons.push({width,app,reference:ref,positions:ranges,motion});
    if(quick)continue;
    scenario='populated';await nav('/');
    assert.deepEqual(await ev('[...document.querySelectorAll(".tiles .tile")].slice(0,3).map(a=>a.getAttribute("href"))'),['/portfolio/verify-work-1','/portfolio/verify-work-3','/portfolio/verify-work-0']);
    assert.deepEqual(await ev('[...document.querySelectorAll(".mc")].map(a=>a.getAttribute("href"))'),['/magazine/new','/magazine/middle','/magazine/old']);
    const ids=await ev('[...document.querySelectorAll("[id]")].map(e=>e.id)');assert.equal(ids.length,new Set(ids).size,'unique SVG ids');
    report.checks.push(`${width}: featured portfolios, newest public posts, detail URLs, no duplicate IDs`);
    for(const path of ['/story','/services','/portfolio','/magazine','/support','/support/booking']){
      await nav(path);await shot(`page-${width}-${path.slice(1).replaceAll('/','-')}`);report.pages.push({path,...await overflow(path)});
      await scroll(await ev('document.documentElement.scrollHeight'));await shot(`page-${width}-${path.slice(1).replaceAll('/','-')}-footer`);
    }
    await nav('/');
    if(width===390){
      await ev('document.querySelector(".gn-burger").click()');await until('!!document.querySelector(".gn-mobile")');await sleep(700);await shot('menu-390-open');
      for(let i=0;i<13;i++){await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});assert.equal(await ev('!!document.activeElement.closest(".gn-mobile")'),true,'focus trapped');}
      await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await until('!document.querySelector(".gn-mobile")');await until('document.activeElement.matches(".gn-burger")');
      await ev('document.querySelector(".gn-burger").click()');await until('!!document.querySelector(".gn-mobile")');await ev(() => document.querySelector('[aria-label="메뉴 닫기"]').click());await until('!document.querySelector(".gn-mobile")');
      await ev('document.querySelector(".gn-burger").click()');await until('!!document.querySelector(".gn-mobile")');await ev(() => document.querySelector('.gn-mobile a[href="/story"]').click());await until('location.pathname==="/story" && !document.querySelector(".gn-mobile")');await sleep(700);
      assert.equal(await ev('getComputedStyle(document.querySelector(".site-page")).transform'),'none','no transform after route transition');
      report.checks.push('Mobile menu: open, close, Escape, focus trap/restore, route navigation');
    }
    scenario='override';await nav('/');assert.equal(await ev('document.querySelector(".hm img").alt'),'교체 hero');assert.equal(await ev('document.querySelector(".gc img").alt'),'교체 care');report.checks.push(`${width}: administrator image override`);
    scenario='error';await nav('/');assert.equal(await ev('document.querySelector(".tile h3").textContent'),'캘러웨이 코리아');report.checks.push(`${width}: API error fallbacks`);
    scenario='empty';await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await nav('/');assert.equal(await ev('document.querySelector(".ld")===null || getComputedStyle(document.querySelector(".ld")).display==="none"'),true);
    assert.equal(await ev('[...document.querySelectorAll(".home-v2 *")].every(e=>getComputedStyle(e).animationName==="none")'),true);await shot(`home-${width}-reduced-motion`);report.checks.push(`${width}: reduced motion`);
  }
  if (!quick && !edgeOnly) {
    await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: introScript.identifier });
    scenario='empty';
    await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
    await ev("sessionStorage.removeItem('simda:site-intro-seen')");
    await send('Page.navigate',{url:origin+'/'});
    await until('!!document.querySelector(".ld")');
    await sleep(700);await shot('loader-assembly');
    await until('!document.querySelector(".ld")');
    await nav('/');assert.equal(await ev('!!document.querySelector(".ld")'),false,'loader once per session');
    await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
    await ev("sessionStorage.removeItem('simda:site-intro-seen')");
    await send('Page.navigate',{url:origin+'/'});await until('!!document.querySelector(".home-v2")');await sleep(100);
    assert.equal(await ev('!!document.querySelector(".ld")'),false,'no loader for reduced motion first visit');
    report.checks.push('Loader: first visit assembly, removed after 2.7s, absent on session revisit and reduced motion first visit');
  }
  if (edgeOnly) {
    for (const [width, height] of [[734,900],[735,900],[1068,900],[1440,780]]) {
      await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
      await nav('/');await overflow(`boundary ${width}x${height}`);
      const mobile=await ev('getComputedStyle(document.querySelector(".gn-burger")).display!=="none"');
      assert.equal(mobile,width<=734,'734px menu breakpoint');
      await shot(`boundary-${width}x${height}`);
      if (width===1440) {
        await ev(() => document.querySelector('[aria-label="고객센터 하위 메뉴"]').click());
        await until('!!document.querySelector(".gn-popover")');
        assert.equal(await ev('getComputedStyle(document.querySelector(".gn-popover")).borderRadius'),'18px');
        await shot('popover-1440');
        await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
        await until('!document.querySelector(".gn-popover")');
        const top=await ev('document.querySelector(".pf-track").getBoundingClientRect().top+scrollY');
        await scroll(top+600);await shot('platform-short-780');
        assert.equal(await ev('getComputedStyle(document.querySelector(".ph-pos")).transform'),'matrix(0.82, 0, 0, 0.82, 0, 0)');
      }
      report.checks.push(`Boundary ${width}x${height}: header, overflow${width===1440?', 18px popover, Escape and short-height phone scale':''}`);
    }
    // Exercise the actual non-scroll-animation declarations, without altering files.
    await ev(() => {
      for (const sheet of document.styleSheets) {
        try { for(let i=sheet.cssRules.length-1;i>=0;i--) if(sheet.cssRules[i].cssText.startsWith('@supports (animation-timeline:')) sheet.deleteRule(i); } catch {}
      }
    });
    assert.equal(await ev('getComputedStyle(document.querySelector(".c4")).opacity'),'1');
    assert.equal(await ev('getComputedStyle(document.querySelector(".n100")).getPropertyValue("--n")'),'100');
    await shot('static-platform');report.checks.push('Static fallback declarations: final platform screen and count values visible');
  }
  await writeFile(join(out,edgeOnly?'edge-report.json':quick?'quick-report.json':'browser-report.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify({checks:report.checks,pages:report.pages.length,exceptions:report.exceptions.length,output:out}));
  assert.equal(report.exceptions.length,0,'no runtime errors');
} catch (error) {
  await writeFile(join(out, 'failed-report.json'), JSON.stringify({ ...report, failure: String(error) }, null, 2));
  throw error;
} finally { ws?.close(); chrome.kill(); server.close(); }
