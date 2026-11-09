// Run after a frontend build: node --import tsx script/assert-service-logos.mjs
// Uses the existing offline Chrome harness; no app server, DB, or external API.
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { clients } from '../client/src/content/brand.ts';
import { openBrowser, sleep } from '../client/src/pages/site/verification/browser.mjs';

const out = '/tmp/simda-six-logos';
const textOnly = [];
assert.equal(clients.length, 40);
assert.equal(clients.filter(client => client.logo).length, 40);
assert.deepEqual(clients.filter(client => !client.logo).map(client => client.name), textOnly);
let overrideTexts = false;
const browser = await openBrowser({ build: 'dist/public', out, apiFixture: ({ path }) => ({
  body: path === '/api/site-texts' && overrideTexts
    ? ['eyebrow', 'title', 'lead'].map(key => ({ key: `services.clients.${key}`, value: `편집 확인 ${key}` }))
    : [],
}) });
const report = [];
try {
  for (const width of [1440, 1068, 390]) {
    await browser.viewport(width);
    await browser.nav('/services');
    await browser.until('document.querySelectorAll(".service-clients li").length === 40');
    const section = await browser.ev(() => {
      const rect = document.querySelector('.service-clients').getBoundingClientRect();
      return { top: rect.top + scrollY, bottom: rect.bottom + scrollY };
    });
    // Trigger lazy loading naturally, including rows below the viewport.
    for (let y = section.top; y < section.bottom; y += 550) await browser.scroll(y);
    await browser.until('[...document.querySelectorAll(".service-clients img")].every(img => img.complete && img.naturalWidth > 0)');
    await browser.to('.service-clients');
    await sleep(500);
    const state = await browser.ev(() => {
      const ul = document.querySelector('.service-clients ul');
      const grid = getComputedStyle(ul);
      const cells = [...ul.children].map(li => {
        const rect = li.getBoundingClientRect();
        const mark = li.querySelector('.service-client-mark');
        const child = mark.firstElementChild;
        const box = child.getBoundingClientRect();
        const center = mark.getBoundingClientRect();
        const css = getComputedStyle(li);
        const img = li.querySelector('img');
        return {
          name: img?.alt ?? child.textContent,
          height: rect.height, width: rect.width,
          padding: [css.paddingTop, css.paddingBottom], border: css.borderTopWidth,
          overflow: box.left < rect.left - 1 || box.right > rect.right + 1 || box.top < rect.top - 1 || box.bottom > rect.bottom + 1 || li.scrollWidth > li.clientWidth,
          centered: Math.abs((box.top + box.bottom - center.top - center.bottom) / 2) < 1,
          leftAligned: Math.abs(box.left - rect.left) < 1,
          logo: img ? {
            src: img.getAttribute('src'), naturalWidth: img.naturalWidth,
            width: img.getAttribute('width'), height: img.getAttribute('height'),
            loading: img.loading, decoding: img.decoding,
            displayWidth: box.width, displayHeight: box.height,
          } : null,
        };
      });
      return { width: innerWidth, scrollWidth: document.documentElement.scrollWidth, columns: grid.gridTemplateColumns.split(' ').length, gap: grid.columnGap, cells };
    });
    assert.equal(state.columns, width === 1440 ? 4 : width === 1068 ? 3 : 2);
    assert.equal(state.gap, width === 390 ? '24px' : '32px');
    assert.ok(state.scrollWidth <= width, 'no page overflow');
    assert.equal(new Set(state.cells.map(cell => cell.height)).size, 1, 'all 40 cells have the same height');
    assert.deepEqual(state.cells.map(cell => cell.name), clients.map(client => client.name));
    assert.equal(state.cells.filter(cell => cell.logo).length, 40, '40 rendered logos');
    assert.equal(state.cells.filter(cell => !cell.logo).length, 0, 'no text-only cells');
    for (const [index, cell] of state.cells.entries()) {
      assert.equal(cell.overflow, false, `${width}: ${cell.name} stays in its cell`);
      assert.ok(cell.centered && cell.leftAligned, `${width}: ${cell.name} alignment`);
      assert.deepEqual(cell.padding, width === 390 ? ['20px', '20px'] : ['24px', '24px']);
      assert.equal(cell.border, '1px');
      if (cell.logo) {
        const expected = clients[index].logo;
        const scale = width === 390 ? .6 : 1;
        assert.ok(cell.logo.naturalWidth > 0);
        assert.equal(cell.logo.src, expected.file);
        assert.equal(cell.logo.width, String(expected.w));
        assert.equal(cell.logo.height, String(expected.h));
        assert.equal(cell.logo.loading, 'lazy');
        assert.equal(cell.logo.decoding, 'async');
        assert.ok(Math.abs(cell.logo.displayWidth - Math.min(expected.w * scale, cell.width)) < 1);
        assert.ok(Math.abs(cell.logo.displayHeight - expected.h * scale) < 1);
      }
    }
    // Fit the section in a taller viewport so the existing fixed booking bar
    // stays below the capture; keep page elements and responsive widths intact.
    // Mobile layout was checked above. A single layout viewport avoids CDP's
    // mobile visual-viewport offset when capturing a tall document clip.
    await browser.send('Emulation.setDeviceMetricsOverride', {
      width, height: Math.ceil(section.bottom - section.top) + 200, deviceScaleFactor: 1, mobile: false,
    });
    await browser.to('.service-clients');
    await sleep(500);
    const clip = await browser.ev(() => {
      const rect = document.querySelector('.service-clients').getBoundingClientRect();
      return { x: 0, y: Math.floor(rect.top + scrollY), width: innerWidth, height: Math.ceil(rect.height), scale: 1 };
    });
    const screenshot = await browser.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip });
    await writeFile(join(out, `services-clients-${width}.png`), Buffer.from(screenshot.data, 'base64'));
    report.push(state);
    console.log(`PASS ${width}px: ${state.columns} columns, 40 loaded logos, 0 text cells, all cells ${state.cells[0].height}px high, no overflow`);
  }
  overrideTexts = true;
  await browser.nav('/services');
  for (const key of ['eyebrow', 'title', 'lead']) {
    await browser.until(`document.querySelector('.service-clients').innerText.includes('편집 확인 ${key}')`);
  }
  assert.equal(browser.report.exceptions.length, 0, JSON.stringify(browser.report.exceptions));
  await writeFile(join(out, 'report.json'), JSON.stringify({ viewports: report, editableKeys: 3, exceptions: browser.report.exceptions }, null, 2));
  console.log(`PASS: all 3 services.clients.* text overrides; zero browser exceptions. Screenshots: ${out}`);
} finally {
  await browser.close();
}
