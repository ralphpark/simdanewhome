import { parseSiteText } from "@/components/site/SiteText";

/** A small, DOM-independent tree keeps conversion testable without a browser. */
export type TextEditorNode = { text: string } | { tag: string; children: TextEditorNode[] };
type Run = { text: string; bold: boolean };
export const normalizeEditorText = (text: string) => text.replace(/\r\n?/g, "\n").replace(/\u00a0/g, " ").replace(/\n{3,}/g, "\n\n").trim();

export function siteTextToTree(value: string): TextEditorNode[] {
  return parseSiteText(normalizeEditorText(value)).flatMap(part => {
    const children = part.text.split("\n").flatMap((text, index): TextEditorNode[] => [...(index ? [{ tag: "br", children: [] }] : []), { text }]);
    return part.emphasized ? [{ tag: "b", children }] : children;
  });
}

export function treeToSiteText(nodes: TextEditorNode[]): string {
  const runs: Run[] = [];
  const append = (text: string, bold: boolean) => {
    if (!text) return;
    const last = runs.at(-1);
    if (last?.bold === bold) last.text += text;
    else runs.push({ text, bold });
  };
  const newline = () => append("\n", false);
  const endsInNewline = () => runs.at(-1)?.text.endsWith("\n");
  function visit(children: TextEditorNode[], bold = false) {
    children.forEach((node, index) => {
      if ("text" in node) { append(node.text, bold); return; }
      const tag = node.tag.toLowerCase();
      if (tag === "br") { append("\n", bold); return; }
      const block = tag === "div" || tag === "p";
      if (block && runs.length && !endsInNewline()) newline();
      visit(node.children, bold || tag === "b" || tag === "strong");
      if (block && index < children.length - 1 && !endsInNewline()) newline();
    });
  }
  visit(nodes);
  // Trim visible boundaries before adding markers, so empty emphasis cannot survive.
  while (runs.length && !runs[0].text.trim()) runs.shift();
  while (runs.length && !runs.at(-1)!.text.trim()) runs.pop();
  if (runs.length) { runs[0].text = runs[0].text.trimStart(); runs.at(-1)!.text = runs.at(-1)!.text.trimEnd(); }
  return normalizeEditorText(runs.map(run => run.bold ? `**${run.text}**` : run.text).join(""));
}

export function readEditorNodes(node: Node): TextEditorNode[] {
  return Array.from(node.childNodes).flatMap((child): TextEditorNode[] => {
    if (child.nodeType === 3) return [{ text: child.textContent ?? "" }];
    if (child.nodeType === 1) return [{ tag: (child as Element).tagName.toLowerCase(), children: readEditorNodes(child) }];
    return [];
  });
}
export function writeEditorNodes(element: HTMLElement, value: string) {
  const create = (node: TextEditorNode): Node => {
    if ("text" in node) return document.createTextNode(node.text);
    const result = document.createElement(node.tag);
    node.children.forEach(child => result.append(create(child)));
    return result;
  };
  element.replaceChildren(...siteTextToTree(value).map(create));
}
