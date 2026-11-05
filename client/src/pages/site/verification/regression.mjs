import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { openBrowser, sleep } from './browser.mjs';
const b=await openBrowser({out:'docs/redesign/verification/subpages-v2/regression'});
const {nav,viewport,ev,until,scroll,to,shot,focus,key,report}=b;
try{
  await viewport(1440);await nav('/portfolio');
  await focus('.gn-logo');await key('Tab');assert.equal(await ev('document.activeElement.getAttribute("href")'),'/story');
  await key('Enter');await until('location.pathname==="/story"');await sleep(550);
  assert.equal(await ev('getComputedStyle(document.querySelector(".site-page")).transform'),'none');assert.equal(await ev('scrollY'),0);
  report.checks.push('Desktop header Tab/Enter route navigation; scroll reset; no remaining transform.');
  await nav('/portfolio');await to('.sp-segments');await focus('.sp-segments button');
  await key('ArrowRight');await sleep(600);assert.equal(await ev('document.activeElement.getAttribute("aria-checked")'),'true');assert.equal(await ev('document.querySelectorAll(".pb-grid .sp-tile").length'),1);
  await key('End');await sleep(500);assert.equal(await ev('document.activeElement.textContent'),'기획');assert.equal(await ev('document.querySelectorAll(".pb-grid .sp-tile").length'),1);
  await key('Home');await sleep(500);assert.equal(await ev('document.querySelectorAll(".pb-grid .sp-tile").length'),6);
  await shot('portfolio-filter-keyboard-1440');report.checks.push('Portfolio radio filter ArrowRight/Home/End; selected state and result count.');
  await nav('/magazine');await to('.sp-segments');await focus('.sp-segments button');await key('ArrowRight');await sleep(550);assert.equal(await ev('document.activeElement.getAttribute("aria-checked")'),'true');
  assert.equal(await ev('[...document.querySelectorAll(".mb-card")].every(a=>!a.href.includes("draft")&&!a.href.includes("future"))'),true);
  await shot('magazine-filter-keyboard-1440');report.checks.push('Magazine keyboard filter and public-post visibility.');
  await nav('/magazine/post-0');
  const progress=async()=>ev('getComputedStyle(document.querySelector(".mb-progress>div")).transform');
  const first=await progress();await to('.mb-article-body',300);await scroll(await ev('scrollY+700'));const middle=await progress();
  await to('.mb-comments');const last=await progress();assert.notEqual(first,middle);assert.notEqual(first,last);assert.equal(await ev('getComputedStyle(document.querySelector(".mb-progress")).top'),'52px');
  report.readingProgress={first,middle,last};await shot('article-progress-1440');report.checks.push('CSS reading progress changes with scroll below sticky 52px header.');
  await viewport(390);await nav('/support');await focus('.gn-burger');await key('Enter');await until('!!document.querySelector(".gn-mobile")');
  for(let i=0;i<13;i++){await key('Tab');assert.equal(await ev('!!document.activeElement.closest(".gn-mobile")'),true);}
  await shot('header-menu-keyboard-390');await key('Escape');await until('!document.querySelector(".gn-mobile")');assert.equal(await ev('document.activeElement.matches(".gn-burger")'),true);
  report.checks.push('Mobile header keyboard open, full focus trap, Escape close and focus restore.');
  for(const width of [734,735,1068]){
    await viewport(width,900);
    for(const path of ['/story','/services','/portfolio','/magazine','/support','/support/b2b','/support/booking']){
      await nav(path);await b.layout(`${path} ${width} breakpoint opening`);
      const section=await ev('document.querySelector(".sp-head-photo")?.offsetHeight || 0');
      await scroll(section+200);await b.layout(`${path} ${width} breakpoint content`);
    }
    await shot(`breakpoint-${width}`);
  }
  report.checks.push('734/735/1068 breakpoints: seven routes opening/content; no overflow or broken images.');
  for(const width of [1440,390]){
    await viewport(width);await nav('/story');
    const start=await ev('getComputedStyle(document.querySelector(".sp-head-image")).clipPath');await scroll(600);const end=await ev('getComputedStyle(document.querySelector(".sp-head-image")).clipPath');assert.notEqual(start,end);
    report.checks.push(`${width}: PageHead CSS clip-path follows scroll with Lenis.`);
    await b.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await nav('/story');
    assert.equal(await ev('[...document.querySelectorAll(".subpage *")].every(e=>getComputedStyle(e).animationName==="none")'),true);
    assert.equal(await ev('getComputedStyle(document.querySelector(".sp-head-stage")).position'),'relative');await b.layout(`story ${width} reduced`);await shot(`reduced-motion-${width}`);
    await b.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  }
  report.checks.push('Reduced motion: animations disabled, no sticky empty track, content visible.');
  await nav('/story');await ev(()=>{for(const sheet of document.styleSheets){try{for(let i=sheet.cssRules.length-1;i>=0;i--){const rule=sheet.cssRules[i];if(rule.constructor.name==='CSSSupportsRule'&&rule.conditionText.includes('animation-timeline'))sheet.deleteRule(i);}}catch{}}});
  assert.notEqual(await ev('getComputedStyle(document.querySelector(".sp-head-stage")).position'),'sticky');assert.equal(await ev('getComputedStyle(document.querySelector(".sp-reveal")).opacity'),'1');await shot('no-scroll-timeline-fallback');
  report.checks.push('Unsupported scroll-timeline fallback remains visible in normal document flow.');
  const prior=JSON.parse(await readFile('docs/redesign/verification/home-v2/browser-report.json','utf8'));
  report.home=[];
  for(const width of [1440,390]){
    b.setScenario('empty');await viewport(width);await nav('/');await sleep(3200);
    const actual=await ev(()=>Object.fromEntries(['.hero-track','.hl-track','.story','.imm-track','.facts','.pf-track','.wk','.mag','.ways','.sig','.ft','.hc .t-hero','.hm','.gn'].map(selector=>{const el=document.querySelector(selector),rect=el.getBoundingClientRect(),style=getComputedStyle(el);return[selector,{top:rect.top+scrollY,left:rect.left,width:rect.width,height:rect.height,font:style.fontSize,background:style.backgroundColor}];})));
    const expected=prior.comparisons.find(item=>item.width===width).app;
    assert.deepEqual(actual,expected,`${width} home geometry changed`);report.home.push({width,geometry:'identical to phase 1',actual});
    await shot(`home-unchanged-${width}`);
  }
  report.checks.push('Approved home: exact geometry/style equality for 14 elements at both widths; screenshots retained.');
  assert.equal(report.exceptions.length,0,JSON.stringify(report.exceptions));
  await writeFile(join(b.out,'report.json'),JSON.stringify(report,null,2));console.log(`PASS ${report.checks.length} integration checks, ${report.pages.length} edge layouts, unchanged home, no runtime exceptions.`);
}finally{await b.close();}
