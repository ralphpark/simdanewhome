// Run: node client/src/pages/site/verification/site-text-editor.mjs
// Build the frontend first; every API/external request is intercepted. No DB/server.
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { openBrowser, sleep } from './browser.mjs';
const out = '/tmp/simda-text-check/editor';
const report = { checks: [], requests: [], exceptions: [] };
let fail = false;
const saved = new Map([['home.hero.title', '관리자가 고친 **첫 제목.**']]);
const b = await openBrowser({ build:'/tmp/simda-text-check/after-dist', out, apiFixture:({path,request}) => {
  if (path === '/api/auth/user') return {body:{id:'offline-admin',email:'admin@example.invalid',role:'admin'}};
  if (path === '/api/site-texts') {
    if (request.method === 'PUT') {
      if (fail) return {status:503,body:{error:'검수용 저장 실패'}};
      for (const {key,value} of JSON.parse(request.postData).changes) value === null ? saved.delete(key) : saved.set(key,value);
      return {body:{success:true}};
    }
    return {body:Array.from(saved,([key,value])=>({key,value,updatedAt:'2026-11-08T00:00:00Z'}))};
  }
  return {body:[]};
}});
const field = key => `[id="text-editor-${key}"]`;
const frameDoc = 'document.querySelector("iframe").contentDocument';
async function tab(label) { await b.ev(`[...document.querySelectorAll('[role="tab"]')].find(e=>e.textContent===${JSON.stringify(label)}).focus()`);await b.key('Enter'); }
async function editorTop() { await b.to('[data-site-texts-admin]',84);await sleep(500); }
async function selectAll(key) {
  await b.ev(`(()=>{const el=document.querySelector(${JSON.stringify(field(key))});el.focus();const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r);})()`);
}
async function input(key,text) {await selectAll(key);await b.send('Input.insertText',{text});await sleep(200);}
async function button(label) {await b.ev(`[...document.querySelectorAll('button')].filter(e=>e.getBoundingClientRect().width).find(e=>e.textContent===${JSON.stringify(label)}).click()`);await sleep(200);}
try {
  await b.viewport(1440);await b.nav('/admin');await tab('사이트 문구');
  await b.until('!!document.querySelector("[contenteditable=true]")');await b.until(`!!${frameDoc}?.querySelector('[data-site-text-key="home.hero.title"]')`);await sleep(2200);await editorTop();
  assert.equal(await b.ev('document.querySelectorAll("iframe").length'),1);
  assert.equal(await b.ev('document.querySelector("[data-text-edit-pane]").getBoundingClientRect().right < document.querySelector("[data-text-preview]").getBoundingClientRect().left'),true);
  assert.equal(await b.ev('document.querySelector("iframe").offsetWidth'),1440);
  await b.layout('editor desktop');await b.shot('desktop-home');report.checks.push('1440 two columns, intrinsic 1440 preview, no overflow');
  assert.ok(await b.ev(`!!document.querySelector(${JSON.stringify(field('home.hero.title'))}).querySelector('b')`));
  assert.equal(await b.ev(`document.querySelector(${JSON.stringify(field('home.hero.title'))}).textContent.includes('**')`),false);
  await input('home.hero.title','새 제목');
  await b.ev(`(()=>{const el=document.querySelector(${JSON.stringify(field('home.hero.title'))});const r=document.createRange();r.setStart(el.firstChild,0);r.setEnd(el.firstChild,1);getSelection().removeAllRanges();getSelection().addRange(r);})()`);
  // Real pointer events ensure the toolbar preserves the current text selection.
  const boldButton=await b.ev(`(()=>{const e=document.querySelector('[data-text-card="home.hero.title"] button[aria-label="강조"]');const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
  await b.send('Input.dispatchMouseEvent',{type:'mousePressed',...boldButton,button:'left',clickCount:1});await b.send('Input.dispatchMouseEvent',{type:'mouseReleased',...boldButton,button:'left',clickCount:1});
  await b.until(`${frameDoc}.querySelector('[data-site-text-key="home.hero.title"] .grad')?.textContent==='새'`);
  await b.ev(`(()=>{const el=document.querySelector(${JSON.stringify(field('home.hero.title'))});el.focus();const r=document.createRange();r.selectNodeContents(el);r.collapse(false);getSelection().removeAllRanges();getSelection().addRange(r);})()`);
  await b.key('Enter');await b.send('Input.insertText',{text:'둘째 줄'});
  await b.until(`${frameDoc}.querySelector('[data-site-text-key="home.hero.title"]').innerText.includes('둘째 줄')`);
  assert.equal(await b.ev(`${frameDoc}.querySelector('[data-site-text-key="home.hero.title"]').innerText`),'새 제목\n둘째 줄');
  await b.shot('desktop-live-edit');report.checks.push('bold toolbar + Chrome Enter immediately update iframe');
  await b.ev(`${frameDoc}.querySelector('[data-site-text-key="home.hero.lead"]').click()`);
  await b.until('document.activeElement.id==="text-editor-home.hero.lead"');report.checks.push('iframe click focuses matching editor');
  assert.equal(await b.ev('(()=>{const e=new Event("beforeunload",{cancelable:true});window.dispatchEvent(e);return e.defaultPrevented;})()'),true);
  await b.ev('window.__confirmMessages=[];window.confirm=(message)=>{window.__confirmMessages.push(message);return false;}');
  await tab('사이트 사진');assert.equal(await b.ev('!!document.querySelector("[data-site-texts-admin]")'),true);assert.equal(await b.ev('window.__confirmMessages.length'),1);report.checks.push('unsaved changes block other tabs and beforeunload');
  await b.fill('input[aria-label="문구 찾기"]','동네 가게');
  const search=await b.ev(`document.querySelector('[aria-label="문구 찾기 결과"]').innerText`);assert.ok(search.includes('홈')&&search.includes('서비스'));report.search=search;await editorTop();await b.shot('desktop-search');
  await b.ev(`[...document.querySelectorAll('[aria-label="문구 찾기 결과"] button')].find(e=>e.innerText.startsWith("서비스")).click()`);
  await b.until('document.activeElement.id.startsWith("text-editor-services.")');assert.ok(await b.ev('document.body.innerText.includes("저장하지 않은 변경 1개")'));report.checks.push('global search navigates across pages and retains draft');
  const serviceKey = await b.ev('document.activeElement.id.slice(12)');
  await input(serviceKey,'다른 페이지에서도 함께 저장');
  await selectAll(serviceKey);await b.key('b',4);
  assert.equal(await b.ev(`!!document.querySelector(${JSON.stringify(field(serviceKey))}).querySelector('b,strong')`),false);report.checks.push('Command+B toggles emphasis');
  await button('모두 저장');await b.until('document.body.innerText.includes("문구를 모두 저장했습니다")');
  const put=b.report.requests.filter(r=>r.method==='PUT').at(-1);assert.equal(put.path,'/api/site-texts');assert.deepEqual(put.body,{changes:[{key:'home.hero.title',value:'**새** 제목\n둘째 줄'},{key:serviceKey,value:'다른 페이지에서도 함께 저장'}]});report.batch=put;
  await tab('홈');await b.until(`!!${frameDoc}?.querySelector('[data-site-text-key="home.hero.title"]')`);
  // Reset is staged and only written through the same batch endpoint.
  await b.ev(`document.querySelector('[data-text-card="home.hero.title"]').querySelectorAll("button")[1].click()`);
  assert.ok(saved.has('home.hero.title'));await button('모두 저장');await b.until('!document.querySelector("[data-text-savebar]")');
  assert.deepEqual(b.report.requests.filter(r=>r.method==='PUT').at(-1).body,{changes:[{key:'home.hero.title',value:null}]});report.checks.push('batch save and null reset payloads');
  await input('home.hero.title','실패해도 남는 변경');fail=true;await button('모두 저장');await b.until('document.body.innerText.includes("저장하지 못했습니다")');assert.equal(await b.ev(`document.querySelector(${JSON.stringify(field('home.hero.title'))}).textContent`),'실패해도 남는 변경');assert.ok(await b.ev('document.body.innerText.includes("저장하지 않은 변경 1개")'));fail=false;await button('모두 저장');await b.until('!document.querySelector("[data-text-savebar]")');report.checks.push('failed save retains draft and retry succeeds');
  await input('home.hero.title','');
  // Input.insertText with empty text does not delete a selection; use a native key.
  await b.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Backspace',code:'Backspace',windowsVirtualKeyCode:8});await b.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Backspace',code:'Backspace',windowsVirtualKeyCode:8});
  await b.until('document.body.innerText.includes("비워 둘 수 없어요")');assert.equal(await b.ev('[...document.querySelectorAll("button")].find(e=>e.textContent==="모두 저장").disabled'),true);await b.shot('desktop-empty');await button('변경 취소');report.checks.push('empty values block save');
  // Paste HTML is discarded; editor receives literal plain text only.
  await selectAll('home.hero.title');await b.ev(`(()=>{const data=new DataTransfer();data.setData('text/plain','붙여넣은 글자');data.setData('text/html','<img src=x onerror=alert(1)><b>서식</b>');document.activeElement.dispatchEvent(new ClipboardEvent('paste',{clipboardData:data,bubbles:true,cancelable:true}));})()`);
  assert.equal(await b.ev(`document.querySelector(${JSON.stringify(field('home.hero.title'))}).textContent`),'붙여넣은 글자');assert.equal(await b.ev(`!!document.querySelector(${JSON.stringify(field('home.hero.title')+' img')})`),false);await button('변경 취소');report.checks.push('plain-text paste strips HTML');
  await b.ev('document.querySelectorAll("[toast-close]").forEach(e=>e.click())');await sleep(400);
  await b.viewport(390);await editorTop();await b.shot('mobile-home');await b.layout('editor mobile');assert.equal(await b.ev('document.querySelectorAll("iframe").length'),0);
  await input('home.hero.title','모바일 미리보기');await button('미리보기');await b.until('!!document.querySelector("[role=dialog] iframe")');await b.until(`${frameDoc}?.querySelector('[data-site-text-key="home.hero.title"]')?.textContent==='모바일 미리보기'`);await sleep(3400);await b.shot('mobile-preview-sheet');
  assert.equal(await b.ev(`getComputedStyle(${frameDoc}.querySelector('.hc-in')).opacity`),'1');
  assert.equal(await b.ev('document.querySelector("iframe").offsetWidth'),390);
  assert.ok(await b.ev('document.querySelector("[role=dialog]").innerText.includes("모두 저장")'));
  await b.ev(`${frameDoc}.querySelector('[data-site-text-key="home.hero.title"]').click()`);await b.until('!document.querySelector("[role=dialog]")');await b.until('document.activeElement.id==="text-editor-home.hero.title"');await b.shot('mobile-selected');report.checks.push('390 single column, full-screen 390 preview sheet, live drafts, click returns focus, visible save bar');
  await button('변경 취소');
  await b.nav('/?textPreview=1');assert.equal(await b.ev('document.querySelectorAll("[data-site-text-key]").length'),0);report.checks.push('standalone URL never enables preview wrappers');
  report.requests=b.report.requests.filter(r=>r.method==='PUT');report.exceptions=b.report.exceptions;
  assert.equal(report.exceptions.length,0);console.log(JSON.stringify(report,null,2));
} catch(error) {report.failure=String(error);report.exceptions=b.report.exceptions;await b.shot('failure');await writeFile(out+'/failure-body.txt',await b.ev('document.body.innerText'));throw error;} finally {await b.close();await writeFile(out+'/report.json',JSON.stringify(report,null,2));}
