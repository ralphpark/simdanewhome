/** Render the existing Tiptap HTML with a small, explicit presentation allowlist. */
export function articleHtml(html: string) {
  const document = new DOMParser().parseFromString(html || "", "text/html");
  const allowed = new Set(["P", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "LI", "BLOCKQUOTE", "PRE", "CODE", "STRONG", "B", "EM", "I", "U", "S", "BR", "HR", "A", "IMG", "FIGURE", "FIGCAPTION", "DIV", "SPAN", "TABLE", "THEAD", "TBODY", "TR", "TH", "TD"]);
  const unsafe = new Set(["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "SVG", "MATH", "FORM", "INPUT", "BUTTON", "TEMPLATE", "LINK", "META"]);
  const safeUrl = (value: string, image: boolean) => {
    if (image && /^data:image\/(?:png|jpe?g|gif|webp|avif);base64,[a-z0-9+/=\s]+$/i.test(value)) return true;
    try { const url = new URL(value, window.location.origin); return ["http:", "https:", ...(!image ? ["mailto:", "tel:"] : [])].includes(url.protocol); } catch { return false; }
  };
  for (const node of Array.from(document.body.querySelectorAll("*"))) {
    if (unsafe.has(node.tagName)) { node.remove(); continue; }
    if (node.tagName === "H1") { const heading = document.createElement("h2"); heading.append(...Array.from(node.childNodes)); node.replaceWith(heading); continue; }
    if (!allowed.has(node.tagName)) { node.replaceWith(...Array.from(node.childNodes)); continue; }
    const alignment = (node as HTMLElement).style?.textAlign;
    for (const attribute of Array.from(node.attributes)) {
      const name = attribute.name.toLowerCase();
      const keep = name === "alt" && node.tagName === "IMG" || name === "title" || name === "src" && node.tagName === "IMG" && safeUrl(attribute.value, true) || name === "href" && node.tagName === "A" && safeUrl(attribute.value, false) || ["colspan", "rowspan"].includes(name) && ["TH", "TD"].includes(node.tagName) && /^\d{1,2}$/.test(attribute.value);
      if (!keep) node.removeAttribute(attribute.name);
    }
    if (["left", "right", "center", "justify"].includes(alignment)) (node as HTMLElement).style.textAlign = alignment;
    if (node.tagName === "A") node.setAttribute("rel", "noopener noreferrer");
    if (node.tagName === "IMG") {
      if (!node.hasAttribute("src")) { node.remove(); continue; }
      node.setAttribute("loading", "lazy"); node.setAttribute("decoding", "async");
      if (!node.hasAttribute("alt")) node.setAttribute("alt", "기사 이미지");
    }
  }
  return document.body.innerHTML;
}
