import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { openBrowser, sleep } from './browser.mjs';
const b=await openBrowser({build:'docs/redesign/verification/subpages-v2/dist',out:'docs/redesign/verification/subpages-v2/forms'});
const {nav,viewport,ev,until,to,shot,focus,key,fill,report}=b;
async function press(selector){await focus(selector);await key('Enter');await sleep(400);}
try{
  for(const width of [1440,390]){
    await viewport(width);await nav('/support/booking');await to('.c-booking-panel');
    assert.equal(await ev('!!document.querySelector(".sp-pass")'),false);
    await press('.c-booking-actions button[type=submit]');
    assert.equal(await ev('document.querySelector("#type-error")?.textContent'),'상담 유형을 선택해 주세요.');
    await shot(`booking-${width}-type-required`);
    await focus('input[value="plant-care"]');await key(' ');
    await press('.c-booking-actions button[type=submit]');await until('!!document.querySelector(".c-calendar")');
    await press('.c-booking-actions button[type=submit]');
    assert.equal(await ev('document.querySelectorAll(".c-field-error").length'),2);
    await to('.c-booking-panel');await shot(`booking-${width}-date-required`);
    const date=await ev('[...document.querySelectorAll("button[data-date]")].find(e=>!e.disabled)?.dataset.date');
    assert.ok(date);await focus(`button[data-date="${date}"]`);await key('Enter');
    await focus('input[value="10:00"]');await key(' ');
    await press('.c-booking-actions button[type=submit]');await until('!!document.querySelector("input[name=name]")');
    await press('.c-booking-actions button[type=submit]');
    assert.equal(await ev('document.querySelectorAll(".sp-field-error").length'),3);
    await to('.c-booking-panel');await shot(`booking-${width}-contact-required`);
    await focus('input[name=name]');
    for(const [name,value] of [['name','검수사용자'],['phone','010-1234-5678'],['email','verify@example.com'],['message','공간에 어울리는 식물 상담을 요청합니다.']]){assert.equal(await ev('document.activeElement.name'),name);await b.send('Input.insertText',{text:value});await key('Tab');}
    assert.equal(await ev('document.activeElement.classList.contains("c-back-button")'),true);await key('Tab');assert.equal(await ev('document.activeElement.type'),'submit');
    assert.equal(await ev('getComputedStyle(document.querySelector(".sp-floating input")).height'),'56px');
    await press('.c-booking-actions button[type=submit]');await until('document.querySelector(".c-booking-progress [aria-current=step]")?.textContent.includes("확인")');
    await to('.c-booking-panel');await shot(`booking-${width}-review`);
    await press('.c-booking-actions button[type=submit]');await until('!!document.querySelector("#booking-success")');
    await to('#booking-success');await shot(`booking-${width}-success`);
    const booking=report.requests.filter(r=>r.path==='/api/bookings').at(-1);
    assert.ok(booking);assert.deepEqual(Object.keys(booking.body).sort(),['consultationType','email','message','name','phone','preferredDate','preferredTime'].sort());assert.equal(booking.body.consultationType,'plant-care');assert.equal(booking.body.preferredTime,'10:00');assert.ok(booking.body.preferredDate.includes('T'));
    report.checks.push(`${width}: booking empty validation at steps 1/2/3; all four steps with keyboard; 56px fields; existing POST /api/bookings payload; success; no PassBar`);
    await nav('/support/b2b');await to('#proposal');await press('button.c-submit');
    assert.equal(await ev('document.querySelectorAll(".sp-field-error").length'),5);await to('.c-proposal-form');await shot(`b2b-${width}-required`);
    await focus('input[name=companyName]');
    for(const [name,value] of [['companyName','검수기업'],['contactName','김검수'],['phone','010-1234-5678'],['email','verify@example.com'],['businessField','식물 공간'],['proposalContent','새로운 사무실 공간의 식물 연출과 유지관리 협업을 제안합니다.']]){assert.equal(await ev('document.activeElement.name'),name);await b.send('Input.insertText',{text:value});await key('Tab');}
    assert.equal(await ev('document.activeElement.classList.contains("c-submit")'),true);
    await press('button.c-submit');await until('!!document.querySelector("#proposal-success")');await to('#proposal-success');await shot(`b2b-${width}-success`);
    const proposal=report.requests.filter(r=>r.path==='/api/b2b-proposals').at(-1);
    assert.ok(proposal);assert.deepEqual(Object.keys(proposal.body).sort(),['companyName','contactName','phone','email','businessField','proposalContent'].sort());assert.equal(proposal.body.companyName,'검수기업');
    report.checks.push(`${width}: B2B required errors; keyboard entry/submission; existing POST /api/b2b-proposals payload; success`);
    await nav('/support');await focus('#faq-question-0');await key('Enter');assert.equal(await ev('document.querySelector("#faq-question-0").getAttribute("aria-expanded")'),'true');await key('ArrowDown');assert.equal(await ev('document.activeElement.id'),'faq-question-1');await key('End');assert.equal(await ev('document.activeElement.id'),'faq-question-7');await key('Home');assert.equal(await ev('document.activeElement.id'),'faq-question-0');await key('Enter');assert.equal(await ev('document.querySelector("#faq-answer-0").hidden'),true);await key('Tab');assert.equal(await ev('document.activeElement.id'),'faq-question-1');
    report.checks.push(`${width}: FAQ Enter toggle, ArrowDown, Home, End, Tab keyboard navigation`);
  }
  assert.equal(report.requests.filter(r=>r.path==='/api/bookings').length,2);assert.equal(report.requests.filter(r=>r.path==='/api/b2b-proposals').length,2);assert.equal(report.exceptions.length,0);
  await writeFile(join(b.out,'forms-report.json'),JSON.stringify(report,null,2));console.log('PASS: '+report.checks.length+' form and keyboard checks; '+report.requests.length+' intercepted submissions; zero runtime exceptions.');
}finally{await b.close();}
