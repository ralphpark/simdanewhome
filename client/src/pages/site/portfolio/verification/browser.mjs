import assert from 'node:assert/strict';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
const output = 'docs/redesign/verification/team-b';
await mkdir(output, {recursive:true});
const base = 'http://127.0.0.1:4102';
const images = [
'https://images.unsplash.com/photo-1784308992954-6c953b02f0a0?auto=format&fit=crop&w=1600&q=85',
'https://images.unsplash.com/photo-1617850687395-620757feb1f3?auto=format&fit=crop&w=1200&q=85',
'https://images.unsplash.com/photo-1730195986404-2749e395935e?auto=format&fit=crop&w=1200&q=85',
'https://images.unsplash.com/photo-1623136299195-570a06bdae6b?auto=format&fit=crop&w=1200&q=85',
'https://images.unsplash.com/photo-1597868165956-03a6827955b1?auto=format&fit=crop&w=1200&q=85',
'https://images.unsplash.com/photo-1773867567771-c971dbab370b?auto=format&fit=crop&w=1600&q=85'];
// Visual fixtures only. All requests are intercepted; nothing is written to a real API.
const portfolios = ['나인원한남, 계절이 머무는 정원','오페라박물관의 초록 풍경','오아제 커뮨 식물 연출','도심에 놓인 작은 숲','함께 심는 초록의 시간','봄, 심다'].map((title,i)=>({id:`project-${i}`,title,category:['garden','조경','plant','styling','교육','planning'][i],description:'공간의 빛과 바람을 살피는 것에서 시작합니다. 건축의 선을 따라 식물의 높이와 질감을 더하고, 계절마다 다른 표정을 만날 수 있도록 정원을 구성했습니다.\n\n일상 속에서 자연스럽게 머무는 곳. 식물이 자라며 공간의 이야기도 함께 깊어집니다.',clientName:'검수용 프로젝트',completedDate:'2026-04-01',thumbnailUrl:images[i],images:[images[0],images[1],images[2],images[3]],featured:i===0}));
const body = `<p>식물을 돌보는 일은 공간을 천천히 바라보는 일에서 시작됩니다. 아침에 창으로 들어오는 빛, 오후의 바람, 사람들이 오가는 동선까지. 작은 변화를 살피다 보면 우리에게 맞는 초록의 자리가 보입니다.</p><h2>빛이 머무는 자리를 찾다</h2><p>화분을 놓기 전에 하루 동안 빛의 움직임을 관찰해 보세요. 같은 방 안에서도 창가와 벽 쪽의 환경은 다릅니다. 잎에 닿는 빛의 양을 살피는 것만으로 식물을 이해하는 첫걸음을 뗄 수 있습니다.</p><p>식물은 각자의 속도로 자랍니다. 흙의 상태를 손으로 느끼고, 잎의 방향을 바라보고, 새순이 자라는 시간을 기다립니다. 그 기다림이 일상에 작은 리듬을 만듭니다.</p><figure><img src="${images[4]}" alt="흙에 어린 식물을 심는 손"><figcaption>초록의 시작을 손으로 느끼는 시간.</figcaption></figure><h2>나의 속도로, 식물의 속도로</h2><p>매일 같은 시간에 잠깐씩 식물을 바라보는 습관을 만들어 보세요. 어제와 달라진 잎 한 장, 조금 더 길어진 줄기가 눈에 들어옵니다. 그렇게 식물은 배경이 아니라 함께 생활하는 존재가 됩니다.</p><blockquote><p>식물을 위한 자리를 만드는 것은 일상에 여백을 만드는 일입니다.</p></blockquote><p>크고 특별한 정원이 아니어도 괜찮습니다. 창가의 작은 화분 하나에서 시작해 보세요. 여러분의 공간에는 어떤 초록이 어울릴까요?</p><h2>작은 돌봄을 이어가는 방법</h2><ul><li>빛과 바람이 드는 방향을 살펴봅니다.</li><li>물을 주기 전에 흙의 상태를 확인합니다.</li><li>식물이 보내는 작은 변화를 기록합니다.</li></ul><p>오늘도 식물과 함께하는 일상을 천천히 만들어 갑니다.</p>`;
const posts = ['초록을 들이는 일, 일상을 돌보는 마음','식물의 자리에서 바라본 공간','손끝으로 만나는 작은 정원','계절을 따라 달라지는 창가'].map((title,i)=>({id:`post-${i}`,title,content:body,excerpt:'식물을 고르고, 자리를 내어주고, 함께 계절을 지나는 일. 우리의 일상에 초록을 들이는 방법을 이야기합니다.',thumbnailUrl:images[[5,0,4,2][i]],category:['plant care','project story','가드닝','plant care'][i],tags:['식물생활','큐레이션'],author:'simda',published:true,publishedAt:`2026-10-${28-i}T00:00:00Z`,createdAt:`2026-09-${20+i}T00:00:00Z`,viewCount:120+i}));
const comments = [{id:'approved',authorName:'초록 독자',content:'창가의 식물을 다시 바라보게 되는 이야기네요.',approved:true,createdAt:'2026-11-01T00:00:00Z'},{id:'pending',authorName:'미승인 작성자',content:'절대 노출되면 안 되는 미승인 댓글',approved:false,createdAt:'2026-11-02T00:00:00Z'}];
const targets = await(await fetch('http://127.0.0.1:9232/json')).json();
const target = targets.find(t=>t.type==='page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
let sequence=0, mode='normal', submitted=[];
const pending=new Map(), exceptions=[], report=[];
function send(method,params={}) { return new Promise((resolve,reject)=>{ const id=++sequence; pending.set(id,{resolve,reject}); ws.send(JSON.stringify({id,method,params})); }); }
ws.onmessage=({data})=>{const msg=JSON.parse(data); if(msg.id){const task=pending.get(msg.id);pending.delete(msg.id);if(msg.error)task?.reject(new Error(JSON.stringify(msg.error)));else task?.resolve(msg.result);} if(msg.method==='Runtime.exceptionThrown')exceptions.push(msg.params.exceptionDetails);if(msg.method==='Fetch.requestPaused')void mock(msg.params).catch(error=>exceptions.push(String(error)));};
async function mock({requestId,request}) {
 const path = new URL(request.url).pathname;
 let status=200, result=[];
 if(mode==='failure' && path.startsWith('/api/') && path!='/api/site-images') {status=500;result={error:'Mocked failure'};}
 else if(path==='/api/site-images') result=[];
 else if(mode==='empty') result=[];
 else if(path==='/api/portfolios') result=mode==='no-featured'?portfolios.map(p=>({...p,featured:false})):portfolios;
 else if(path==='/api/posts') result=[...posts.slice().reverse(),{...posts[0],id:'draft',title:'미발행 글',published:false},{...posts[0],id:'future',title:'예약 발행 글',publishedAt:'2099-01-01T00:00:00Z'}];
 else if(path.endsWith('/comments')) {
   if(request.method==='POST') { const values=JSON.parse(request.postData);submitted.push(values);result={...values,id:'new',approved:false}; }
   else result=comments;
 }
 else if(path.startsWith('/api/portfolios/')) result=portfolios.find(p=>path.endsWith('/'+p.id));
 else if(path.startsWith('/api/posts/')) result=posts.find(p=>path.endsWith('/'+p.id));
 if(!result){status=404;result={error:'Not found'};}
 await send('Fetch.fulfillRequest',{requestId,responseCode:status,responseHeaders:[{name:'Content-Type',value:'application/json; charset=utf-8'}],body:Buffer.from(JSON.stringify(result)).toString('base64')});
}
async function evaluate(expression){if(typeof expression==='function')expression=`(${expression.toString()})()`;const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(expression){for(let i=0;i<100;i++){if(await evaluate(expression))return;await sleep(100);}throw new Error('Timed out: '+expression);}
async function navigate(path){await send('Page.navigate',{url:base+path});await until('!!document.querySelector(".team-b")');await sleep(2300);await evaluate('Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,2000))])');}
async function scrollTo(selector,offset=80){await evaluate(`window.scrollTo({top:document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect().top+scrollY-${offset},behavior:'instant'})`);await sleep(1000);}
async function shot(name){const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(`${output}/${name}.png`,Buffer.from(r.data,'base64'));}
async function viewport(width){await send('Emulation.setDeviceMetricsOverride',{width,height:width===390?844:1000,deviceScaleFactor:1,mobile:width===390});}
async function checkLayout(path,width){const r=await evaluate(`({path:location.pathname,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,title:document.querySelector('h1')?.getAttribute('aria-label')||document.querySelector('h1')?.innerText,images:[...document.querySelectorAll('.team-b img')].filter(i=>i.getBoundingClientRect().top<innerHeight && i.getBoundingClientRect().bottom>0).map(i=>({loaded:i.complete&&i.naturalWidth>0,src:i.currentSrc.substring(0,100)}))})`);assert.equal(r.scrollWidth,width,`overflow ${path} at ${width}`);report.push(r);}
await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Network.setBlockedURLs',{urls:['*cdn.channel.io/*','*api.channel.io/*']});await send('Fetch.enable',{patterns:[{urlPattern:base+'/api/*'}]});
if (process.argv.includes('--layout')) {
 try {
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  for(const width of [390,734,1068,1440]) {
   await viewport(width);await navigate('/portfolio');await scrollTo('#portfolio-work');await checkLayout('/portfolio-grid',width);await shot(`portfolio-grid-${width}`);
   if(width===734)assert.equal(await evaluate('getComputedStyle(document.querySelector(".pb-tile")).gridColumnStart'),'span 3');
   if(width===390){await evaluate(`Array.from(document.querySelectorAll('.b-segments button')).find(b=>b.textContent==='정원').click()`);await sleep(1000);await shot('portfolio-filter-390');mode='empty';await navigate('/portfolio');await scrollTo('#portfolio-work');await shot('portfolio-empty-390');mode='normal';}
  }
  assert.equal(exceptions.length,0,JSON.stringify(exceptions));
  await writeFile(`${output}/layout-report.json`,JSON.stringify({result:'PASS',pages:report,exceptions},null,2));console.log('PASS: final portfolio grid at all four widths');
 } finally {ws.close();}
 process.exit(0);
}
if (process.argv.includes('--polish')) {
 try {
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  await viewport(390);await navigate('/portfolio');await scrollTo('#portfolio-work');
  const segment=await evaluate('({width:document.querySelector(".b-segment-scroll").clientWidth,scroll:document.querySelector(".b-segment-scroll").scrollWidth})');
  assert.ok(segment.scroll<=segment.width+1,JSON.stringify(segment));await checkLayout('/portfolio',390);await shot('portfolio-grid-390');
  await evaluate('document.querySelector(".b-segments button").focus()');
  for(let i=0;i<6;i++){await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});}
  assert.equal(await evaluate('document.activeElement.textContent'),'기획');
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r',unmodifiedText:'\r'});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await sleep(1000);
  assert.equal(await evaluate('document.querySelectorAll(".pb-tile").length'),1);assert.equal(await evaluate('document.activeElement.getAttribute("aria-pressed")'),'true');
  await shot('portfolio-keyboard-390');
  await evaluate('document.querySelector(".pb-tile-link").click()');await until('location.pathname==="/portfolio/project-5"');await sleep(1000);assert.equal(await evaluate('scrollY'),0);assert.equal(await evaluate('document.querySelector("h1").getAttribute("aria-label")'),portfolios[5].title);
  await scrollTo('.pb-next');await evaluate('document.querySelector(".pb-next-link").click()');await until('location.pathname==="/portfolio/project-0"');await sleep(1000);assert.equal(await evaluate('scrollY'),0);assert.equal(await evaluate('document.querySelector("h1").getAttribute("aria-label")'),portfolios[0].title);
  await navigate('/magazine');await scrollTo('.mb-stories');await shot('magazine-grid-390');
  await evaluate('document.querySelector(".mb-card").click()');await until('location.pathname==="/magazine/post-0"');await sleep(1000);assert.equal(await evaluate('scrollY'),0);
  await scrollTo('.mb-related');await shot('magazine-related-390');await evaluate('document.querySelector(".mb-related .mb-card").click()');await sleep(1200);assert.equal(await evaluate('scrollY'),0);assert.notEqual(await evaluate('location.pathname'),'/magazine/post-0');
  for(const width of [734,1068]) {await viewport(width);await navigate('/portfolio');await scrollTo('#portfolio-work');await checkLayout('/portfolio-grid',width);await shot(`portfolio-grid-${width}`);await navigate('/magazine');await checkLayout('/magazine',width);await shot(`magazine-${width}`);}
  mode='no-featured';await viewport(390);await navigate('/portfolio');assert.equal(await evaluate('document.querySelector(".pb-feature-link")===null'),true);assert.equal(await evaluate('document.querySelectorAll(".pb-tile").length'),6);
  assert.equal(exceptions.length,0,JSON.stringify(exceptions));
  await writeFile(`${output}/polish-report.json`,JSON.stringify({result:'PASS',checks:['All seven portfolio categories fit at 390px','Tab and Enter category selection; focus preserved','Project and article links, next and related navigation reset scroll','Tablet grids at 734 and 1068','Hero fallback when no featured project'],segment,pages:report,exceptions},null,2));
  console.log('PASS: final layout and keyboard/navigation checks');
 } finally {ws.close();}
 process.exit(0);
}
try {
 for(const width of [1440,390,734,1068]){
  await viewport(width);
  for(const path of ['/portfolio','/portfolio/project-0','/magazine','/magazine/post-0']){
   await navigate(path);await checkLayout(path,width);
   if([1440,390].includes(width)){
    const prefix=path.replace(/^\//,'').replace('/project-0','-detail').replace('/post-0','-detail');await shot(`${prefix}-${width}`);
    if(path==='/portfolio'){
      await evaluate('window.scrollTo(0,220)');await sleep(900);await shot(`portfolio-shrink-${width}`);
      await scrollTo('#portfolio-work');await shot(`portfolio-grid-${width}`);
      assert.equal(await evaluate('document.querySelectorAll(".pb-year li").length'),103);
      await evaluate(`Array.from(document.querySelectorAll('.b-segments button')).find(b=>b.textContent==='정원').click()`);await sleep(900);
      assert.equal(await evaluate('document.querySelectorAll(".pb-tile").length'),1);assert.equal(await evaluate('document.querySelectorAll(".pb-year li").length > 0'),true);
      await shot(`portfolio-filter-${width}`);await scrollTo('#portfolio-archive');await sleep(900);await shot(`portfolio-archive-${width}`);
      await evaluate(`Array.from(document.querySelectorAll('.b-segments button')).find(b=>b.textContent==='전체').click()`);
    } else if(path==='/portfolio/project-0'){
      await scrollTo('.pb-detail-info');await shot(`portfolio-detail-story-${width}`);await scrollTo('.pb-sequence');await shot(`portfolio-detail-images-${width}`);await scrollTo('.pb-next');await shot(`portfolio-next-${width}`);
    } else if(path==='/magazine'){
      assert.equal(await evaluate('document.querySelector("h1").getAttribute("aria-label")'),posts[0].title);
      assert.equal(await evaluate('document.querySelectorAll(".mb-card").length'),4);
      await scrollTo('.mb-stories');await shot(`magazine-grid-${width}`);
      await evaluate(`Array.from(document.querySelectorAll('.b-segments button')).find(b=>b.textContent==='식물 돌봄').click()`);await sleep(1000);assert.equal(await evaluate('document.querySelectorAll(".mb-card").length'),2);
    } else {
      await scrollTo('.mb-article-body');await shot(`magazine-reading-${width}`);
      assert.equal(await evaluate('getComputedStyle(document.querySelector(".mb-article-body")).fontSize'),'17px');
      assert.equal(await evaluate('getComputedStyle(document.querySelector(".mb-article-body")).lineHeight'),'27.2px');
      await scrollTo('.mb-comments');await shot(`magazine-comments-${width}`);
      assert.equal(await evaluate('document.querySelector(".mb-comment-list").textContent.includes("미승인")'),false);
      assert.equal(await evaluate('document.querySelectorAll(".mb-related .mb-card").length'),3);
      assert.ok(await evaluate('new DOMMatrixReadOnly(getComputedStyle(document.querySelector(".mb-progress > div")).transform).a')>.95);
    }
   }
  }
 }
 await viewport(390);await navigate('/magazine/post-0');
 await evaluate(()=>{const set=(selector,value)=>{const input=document.querySelector(selector);const prototype=input.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(prototype,'value').set.call(input,value);input.dispatchEvent(new Event('input',{bubbles:true}));};set('#comment-name','검수 작성자');set('#comment-email','review@example.com');set('#comment-content','검수용 댓글입니다.');});
 await evaluate('document.querySelector(".mb-comment-form").requestSubmit()');await until('document.querySelector(".mb-comment-submit").textContent.includes("접수되었습니다")');
 assert.deepEqual(submitted,[{authorName:'검수 작성자',authorEmail:'review@example.com',content:'검수용 댓글입니다.'}]);assert.equal(await evaluate('document.querySelector("#comment-content").value'),'');
 await scrollTo('.mb-comment-form');await shot('comment-submitted-390');
 mode='empty';for(const width of [1440,390]){await viewport(width);await navigate('/magazine');await shot(`magazine-empty-${width}`);await checkLayout('/magazine-empty',width);await navigate('/portfolio');assert.equal(await evaluate('document.querySelectorAll(".pb-year li").length'),103);await scrollTo('#portfolio-work');await shot(`portfolio-empty-${width}`);}
 mode='failure';await navigate('/magazine');assert.equal(await evaluate('document.body.textContent.includes("이야기를 불러오지 못했습니다")'),true);await shot('magazine-error-390');
 mode='normal';await navigate('/magazine/missing');assert.equal(await evaluate('document.body.textContent.includes("글을 찾을 수 없습니다")'),true);
 await navigate('/portfolio/missing');assert.equal(await evaluate('document.body.textContent.includes("프로젝트를 찾을 수 없습니다")'),true);
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await navigate('/portfolio');assert.equal(await evaluate('getComputedStyle(document.querySelector(".pb-hero")).transform'),'none');assert.equal(await evaluate('getComputedStyle(document.querySelector(".b-mask-line > span")).transform'),'none');await shot('portfolio-reduced-390');
 await navigate('/magazine');await scrollTo('.mb-stories');assert.equal(await evaluate('[...document.querySelectorAll(".mb-grid > div")].every(d=>getComputedStyle(d).opacity==="1")'),true);
 // Isolated raster data URL fixtures for thumbnail and HTML images.
 const pixel='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aK1sAAAAASUVORK5CYII=';
 posts[0].thumbnailUrl=pixel;posts[0].content=`<h1>본문 제목</h1><p>검수 본문</p><img src="${pixel}" onerror="window.__unsafe=true"><script>window.__unsafe=true</script><a href="javascript:alert(1)">링크</a>`;
 await navigate('/magazine/post-0');await until('document.querySelector(".mb-article-cover img")?.naturalWidth===1');
 assert.equal(await evaluate('document.querySelectorAll(".mb-article-body h1,.mb-article-body script,.mb-article-body [onerror],.mb-article-body a[href]").length'),0);assert.equal(await evaluate('window.__unsafe===true'),false);assert.equal(await evaluate('document.querySelector(".mb-article-body img").getAttribute("src").startsWith("data:image/png")'),true);
 assert.equal(exceptions.length,0,JSON.stringify(exceptions));
 await writeFile(`${output}/browser-report.json`,JSON.stringify({result:'PASS',mocked:true,checks:['4 routes at 390/734/1068/1440; no overflow','103 archive entries and synchronized category filtering','latest published post, no draft/future posts','3 related posts','approved comments only; original POST contract; pending feedback','empty and error states; missing details','17px/1.6 article typography','reading progress reaches completion','reduced motion static','raster data URLs preserved; unsafe HTML stripped'],pages:report,exceptions},null,2));
 console.log(JSON.stringify({result:'PASS',layouts:report.length,screenshots:'saved',exceptions}));
} finally {ws.close();}
