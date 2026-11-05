import assert from 'node:assert/strict';
import { writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { openBrowser } from './browser.mjs';
const args = process.argv.slice(2), arg = (key,fallback) => args.includes(key)?args[args.indexOf(key)+1]:fallback;
const group=arg('--group','all');
const groups={a:['/story','/services'],b:['/portfolio','/portfolio/project-0','/magazine','/magazine/post-0'],c:['/support','/support/b2b','/support/booking','/not-a-page'],common:['/src/pages/site/verification/common-preview.html']};
const routes=groups[group] || [...groups.a,...groups.b,...groups.c];
const browser=await openBrowser({build:arg('--build','docs/redesign/verification/subpages-v2/dist'),out:arg('--out',`docs/redesign/verification/subpages-v2/${group==='all'?'screenshots':'agent-'+group}`)});
const {nav,viewport,ev,scroll,shot,layout,report,out}=browser;
try{
  for(const width of [1440,390]){
    await viewport(width);
    for(const path of routes){
      await nav(path);const slug=path.slice(1).replaceAll('/','-');
      await layout(`${path} ${width} opening`);await shot(`${slug}-${width}-opening`);
      const height=await ev('document.documentElement.scrollHeight-innerHeight');
      const points=width===1440?[.3,.62,.93]:[.4,.88];
      for(let i=0;i<points.length;i++){await scroll(height*points[i]);await layout(`${path} ${width} scroll-${i+1}`);await shot(`${slug}-${width}-scroll-${i+1}`);}
    }
  }
  assert.equal(report.exceptions.length,0,JSON.stringify(report.exceptions));
  report.checks.push('Every route: desktop/mobile opening and scrolls, no horizontal overflow, no visible broken images, sticky header, zero runtime exceptions.');
  await writeFile(join(out,'report.json'),JSON.stringify(report,null,2));
  const images=(await readdir(out)).filter(file=>file.endsWith('.png')).sort();
  await writeFile(join(out,'index.html'),'<!doctype html><meta charset="utf-8"><title>하위 페이지 검수</title><style>body{font:16px system-ui;margin:24px;background:#f5f5f7}main{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}img{width:100%;border-radius:12px}figure{margin:0}a{color:#03473e}</style><h1>하위 페이지 검수 — '+group+'</h1><main>'+images.map(file=>`<figure><a href="${file}"><img loading="lazy" src="${file}"></a><figcaption>${file}</figcaption></figure>`).join('')+'</main>');
  console.log(`PASS ${routes.length} routes; ${images.length} screenshots; ${report.pages.length} layout checks. ${out}`);
}finally{await browser.close();}
