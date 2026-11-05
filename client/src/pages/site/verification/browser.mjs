// Disposable, offline Chrome/CDP harness. No API server, environment loading, or external requests.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdir, mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { resolve, join, extname } from 'node:path';
export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const pictures = ['work1', 'landscape', 'work2', 'work3', 'education', 'sales'];
export const portfolios = ['나인원한남, 계절이 머무는 정원', '오페라박물관의 초록 풍경', '캘러웨이 코리아', '헤이즈밀 베이커리', '함께 심는 초록의 시간', '봄을 맞이하는 공간'].map((title, i) => ({
  id: `project-${i}`, title, category: ['garden', '조경', 'plant', 'styling', '교육', 'planning'][i],
  description: '공간의 빛과 바람을 살피는 것에서 시작합니다. 건축의 선을 따라 식물의 높이와 질감을 더하고, 계절마다 다른 표정을 만날 수 있도록 정원을 구성했습니다.\n\n일상 속에서 자연스럽게 머무는 곳. 식물이 자라며 공간의 이야기도 함께 깊어집니다.',
  clientName: '검수용 클라이언트', completedDate: '2026-04-01', thumbnailUrl: `/images/home/${pictures[i]}.jpg`, images: ['/images/home/work1.jpg', '/images/home/landscape.jpg', '/images/home/work2.jpg'], featured: i === 0,
}));
const article = '<p>식물을 돌보는 일은 공간을 천천히 바라보는 일에서 시작됩니다. 아침에 창으로 들어오는 빛, 오후의 바람, 사람들이 오가는 동선까지. 작은 변화를 살피다 보면 우리에게 맞는 초록의 자리가 보입니다.</p><h2>빛이 머무는 자리를 찾다</h2><p>화분을 놓기 전에 하루 동안 빛의 움직임을 관찰해 보세요. 같은 공간 안에서도 창가와 방 안쪽의 환경은 달라집니다. 식물의 성격에 맞는 자리를 찾으면 돌봄의 시작이 한결 쉬워집니다.</p><img src="/images/home/plant-studio.jpg" alt="빛이 드는 식물 공간"><h2>함께 자라는 일상</h2><p>작은 잎 하나의 변화에서도 계절을 느낄 수 있습니다. 물을 주는 날과 새잎이 난 날을 기록해 보세요. 돌봄을 이어갈수록 식물과 공간을 이해하는 시간이 쌓입니다.</p><p>식물은 각자의 속도로 자랍니다. 우리 집에서 편안하게 머물 수 있는 자리를 천천히 찾아보세요. 큐레이터와 함께 빛과 온도, 물 주는 습관을 살펴보는 것도 좋은 시작입니다.</p><img src="/images/home/education.jpg" alt="식물을 심는 손"><p>오랫동안 함께할 초록의 일상을 심다와 시작해 보세요.</p>';
export const posts = ['겨울에도 건강한 초록을 위한 돌봄', '식물이 바꾸는 공간의 표정', '동네 가게가 전하는 따뜻한 선물', '작은 화분에서 시작하는 일상', '함께 만드는 초록의 시간'].map((title, i) => ({
  id: `post-${i}`, title, excerpt: '식물과 함께하는 일상. 빛과 바람을 살피며 우리 공간에 맞는 초록을 찾아갑니다.', content: article,
  thumbnailUrl: `/images/home/${['plant-studio', 'work1', 'platform', 'plant-pot', 'education'][i]}.jpg`, category: ['Plant Care', 'Project Story', 'news', 'Plant Care', 'news'][i],
  author: 'simda', tags: ['식물', '일상'], viewCount: 120 + i, published: true, publishedAt: `2026-0${9-i}-10`, createdAt: `2026-0${9-i}-10`,
}));
const timelines = [
  { id:'timeline-1', year:'2016', title:'심다의 첫 시작', description:'국내 1호 식물 큐레이터의 시작.' },
  { id:'timeline-2', year:'2021', title:'주식회사 에스아이엠지오 설립', description:'식물과 공간을 잇는 새로운 가능성.' },
  { id:'timeline-3', year:'2025', title:'지역 기반 식물 플랫폼 특허 등록', description:'우리 동네 가게와 함께합니다.' },
];

export async function openBrowser({ build = 'docs/redesign/verification/subpages-v2/dist', out = 'docs/redesign/verification/subpages-v2' } = {}) {
  build = resolve(build); out = resolve(out); await mkdir(out, { recursive:true });
  const report = { checks:[], pages:[], requests:[], exceptions:[] }; let scenario = 'normal';
  const server = createServer(async (req, res) => {
    try {
      const pathname = new URL(req.url, 'http://localhost').pathname;
      const file = extname(pathname) ? resolve(build, '.' + pathname) : join(build, 'index.html');
      if (!file.startsWith(build + '/')) { res.writeHead(403).end(); return; }
      const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.jpg':'image/jpeg', '.png':'image/png', '.svg':'image/svg+xml', '.woff2':'font/woff2' };
      const content = await readFile(file);
      res.writeHead(200, { 'Content-Type':mime[extname(file)] || 'application/octet-stream' }).end(content);
    } catch { res.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const profile = await mkdtemp(join(out, 'chrome-'));
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-component-update', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio:'ignore' });
  let ws;
  async function close() { ws?.close(); chrome.kill(); server.close(); await sleep(250); await rm(profile, { recursive:true, force:true }).catch(() => {}); }
  try {
    let port;
    for(let i=0;i<100;i++){try{port=(await readFile(join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0];break;}catch{await sleep(100);}}
    assert.ok(port, 'Chrome starts');
    const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
    ws = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
    await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
    let id=0; const pending=new Map();
    const send = (method,params={}) => new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});
    ws.onmessage = async ({data}) => {
      const message = JSON.parse(data);
      if(message.id){const promise=pending.get(message.id);pending.delete(message.id);message.error?promise?.reject(new Error(JSON.stringify(message.error))):promise?.resolve(message.result);}
      if(message.method==='Runtime.exceptionThrown') report.exceptions.push(message.params.exceptionDetails);
      if(message.method!=='Fetch.requestPaused')return;
      const {requestId,request,resourceType}=message.params, url=new URL(request.url);
      try{
        if(url.pathname.startsWith('/api/')){
          let body=[], status=200; const path=url.pathname;
          if(request.method==='POST'){
            report.requests.push({method:request.method,path,body:JSON.parse(request.postData || '{}')});
            body={id:'fixture-success',success:true,...JSON.parse(request.postData || '{}')};
          }else if(scenario==='error')status=503;
          else if(path==='/api/portfolios')body=scenario==='empty'?[]:portfolios;
          else if(path.startsWith('/api/portfolios/')){body=portfolios.find(item=>item.id===path.split('/').at(-1));if(!body)status=404;}
          else if(path==='/api/posts')body=scenario==='empty'?[]:[...posts,{...posts[0],id:'draft',published:false},{...posts[0],id:'future',publishedAt:'2099-01-01'}];
          else if(path.endsWith('/comments'))body=[{id:'comment-1',authorName:'독자',content:'식물과 함께하는 일상이 궁금해집니다.',createdAt:'2026-09-12',approved:true},{id:'comment-private',authorName:'비공개',content:'미승인 댓글',createdAt:'2026-09-13',approved:false}];
          else if(path.startsWith('/api/posts/')){body=posts.find(item=>item.id===path.split('/').at(-1));if(!body)status=404;}
          else if(path==='/api/timelines')body=scenario==='empty'?[]:timelines;
          await send('Fetch.fulfillRequest',{requestId,responseCode:status,responseHeaders:[{name:'Content-Type',value:'application/json'}],body:Buffer.from(JSON.stringify(body || {error:'Not found'})).toString('base64')});
        }else if(url.origin!==origin && !['data:','blob:'].includes(url.protocol)){
          if(resourceType==='Image')await send('Fetch.fulfillRequest',{requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'image/jpeg'}],body:(await readFile(join(build,'images/home/hero.jpg'))).toString('base64')});
          else await send('Fetch.failRequest',{requestId,errorReason:'BlockedByClient'});
        }else await send('Fetch.continueRequest',{requestId});
      }catch(error){report.exceptions.push(String(error));}
    };
    async function ev(expression){const result=await send('Runtime.evaluate',{expression:typeof expression==='function'?`(${expression.toString()})()`:expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw Error(JSON.stringify(result.exceptionDetails));return result.result.value;}
    async function until(expression){for(let i=0;i<120;i++){if(await ev(expression))return;await sleep(80);}throw Error(`Timeout: ${expression}`);}
    async function nav(path){await send('Page.navigate',{url:origin+path});await until('!!document.querySelector("h1")');await sleep(650);await ev('document.fonts.ready');}
    async function viewport(width,height=width===390?844:900){await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<=734});}
    async function scroll(y){await ev(`window.scrollTo({top:${Math.max(0,y)},behavior:'instant'})`);await sleep(280);}
    async function to(selector,offset=90){await scroll(await ev(`document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect().top+scrollY-${offset}`));}
    async function shot(name){const result=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(join(out,name+'.png'),Buffer.from(result.data,'base64'));}
    async function key(key,modifiers=0){const code={Tab:9,Enter:13,Escape:27,ArrowRight:39,ArrowLeft:37,ArrowDown:40,ArrowUp:38,Home:36,End:35,' ':32}[key];await send('Input.dispatchKeyEvent',{type:'keyDown',key,code:key===' '?'Space':key,windowsVirtualKeyCode:code,modifiers,...(key==='Enter'?{text:'\r'}:{})});await send('Input.dispatchKeyEvent',{type:'keyUp',key,code:key===' '?'Space':key,windowsVirtualKeyCode:code,modifiers});await sleep(80);}
    async function focus(selector){await ev(`document.querySelector(${JSON.stringify(selector)}).focus()`);}
    async function fill(selector,value){await focus(selector);await send('Input.insertText',{text:value});await key('Tab');}
    async function click(selector){await ev(`document.querySelector(${JSON.stringify(selector)}).click()`);await sleep(300);}
    async function layout(label){const state=await ev(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,scrollY,headerTop:document.querySelector('.gn')?.getBoundingClientRect().top,title:document.querySelector('h1')?.innerText,brokenImages:[...document.querySelectorAll('.subpage img')].filter(img=>img.getBoundingClientRect().top<innerHeight&&img.getBoundingClientRect().bottom>0&&img.complete&&!img.naturalWidth).map(img=>img.src)}));assert.ok(state.scrollWidth<=state.width,label+' horizontal overflow '+JSON.stringify(state));assert.equal(state.brokenImages.length,0,label+' images');if(state.headerTop!==undefined)assert.equal(Math.round(state.headerTop),0,label+' sticky header');report.pages.push({label,...state});return state;}
    await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Fetch.enable',{patterns:[{urlPattern:'*'}]});
    await send('Page.addScriptToEvaluateOnNewDocument',{source:"sessionStorage.setItem('simda:site-intro-seen','1')"});
    await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
    return {send,ev,until,nav,viewport,scroll,to,shot,key,focus,fill,click,layout,report,out,origin,close,setScenario:value=>{scenario=value;}};
  }catch(error){await close();throw error;}
}
