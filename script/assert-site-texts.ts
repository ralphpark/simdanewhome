// Run: node --import tsx script/assert-site-texts.ts
import { siteTextToTree, treeToSiteText, normalizeEditorText } from "../client/src/components/admin/siteTextEditorFormat";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { parseSiteText, renderSiteText } from "../client/src/components/site/SiteText";
import { siteTextKeys, siteTexts } from "../client/src/content/siteTexts";

assert.deepEqual(parseSiteText("보통 글"), [{ text: "보통 글", emphasized: false }]);
assert.deepEqual(parseSiteText("첫 줄\n다음 줄"), [{ text: "첫 줄\n다음 줄", emphasized: false }]);
assert.deepEqual(parseSiteText("앞 **강조** 뒤"), [{ text: "앞 ", emphasized: false }, { text: "강조", emphasized: true }, { text: " 뒤", emphasized: false }]);
assert.deepEqual(parseSiteText("앞 **짝이 없는 글"), [{ text: "앞 **짝이 없는 글", emphasized: false }]);
assert.deepEqual(parseSiteText("**맞는 짝** 뒤 **"), [{ text: "**맞는 짝** 뒤 **", emphasized: false }]);
assert.deepEqual(parseSiteText("****"), [{ text: "", emphasized: false }, { text: "", emphasized: true }, { text: "", emphasized: false }]);
assert.equal(renderToStaticMarkup(renderSiteText("첫 줄\n**다음 줄**")), "첫 줄<br/><b>다음 줄</b>");
assert.equal(renderToStaticMarkup(renderSiteText("**강조**", "grad")), '<span class="grad">강조</span>');
assert.equal(renderToStaticMarkup(renderSiteText('<img src=x onerror="alert(1)">')), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
assert.equal(renderToStaticMarkup(renderSiteText("**짝 안 맞음\n그대로")), "**짝 안 맞음<br/>그대로");
assert.equal(new Set(siteTextKeys).size, siteTextKeys.length);
for (const key of siteTextKeys) {
  assert.ok(siteTexts[key].value.trim().length > 0 && siteTexts[key].value.length <= 2000, key);
}
console.log(`PASS: parser, line breaks, emphasis, unmatched/empty markers, escaped HTML; ${siteTextKeys.length} defaults`);

for (const text of ["보통 글", "첫 줄\n다음 줄", "앞 **강조** 뒤", "**첫 줄\n다음 줄**", "짝이 **안 맞음", "첫 줄\n\n셋째 줄", "<img src=x>"]) {
  assert.equal(treeToSiteText(siteTextToTree(text)), text, `roundtrip ${text}`);
}
assert.equal(treeToSiteText([{text:"첫 줄"},{tag:"div",children:[{text:"다음 줄"}]}]), "첫 줄\n다음 줄");
assert.equal(treeToSiteText([{tag:"div",children:[{text:"첫 줄"}]},{tag:"div",children:[{tag:"br",children:[]}]},{tag:"div",children:[{text:"셋째 줄"}]}]), "첫 줄\n\n셋째 줄");
assert.equal(treeToSiteText([{tag:"b",children:[{text:"겹친 "},{tag:"strong",children:[{text:"굵게"}]},{text:" 표시"}]}]), "**겹친 굵게 표시**");
assert.equal(treeToSiteText([{tag:"p",children:[{tag:"i",children:[{text:"글자만"}]}]},{tag:"p",children:[{text:"다음"}]}]), "글자만\n다음");
assert.equal(treeToSiteText([{tag:"b",children:[{text:"   "}]}]), "");
assert.equal(normalizeEditorText("  앞\n\n\n\n뒤  "), "앞\n\n뒤");
for (const key of siteTextKeys) assert.equal(treeToSiteText(siteTextToTree(siteTexts[key].value)), siteTexts[key].value, key);
console.log("PASS: all default roundtrips, Chrome Enter blocks, nested bold, plain tags, empty emphasis, whitespace");
