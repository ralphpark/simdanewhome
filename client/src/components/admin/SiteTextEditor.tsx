import { useLayoutEffect, useRef, useState } from "react";
import { Bold } from "lucide-react";
import { Button } from "@/components/ui/button";
import { readEditorNodes, treeToSiteText, writeEditorNodes } from "./siteTextEditorFormat";

export function SiteTextEditor({ id, label, value, em, disabled, invalid, onChange, onFocus }: {
  id: string; label: string; value: string; em: "b" | "grad"; disabled: boolean; invalid: boolean;
  onChange: (value: string) => void; onFocus: () => void;
}) {
  const field = useRef<HTMLDivElement>(null);
  const composing = useRef(false);
  const [bold, setBold] = useState(false);
  useLayoutEffect(() => {
    if (field.current && treeToSiteText(readEditorNodes(field.current)) !== value) writeEditorNodes(field.current, value);
  }, [value]);
  const update = () => {
    if (field.current && !composing.current) onChange(treeToSiteText(readEditorNodes(field.current)));
    setBold(document.queryCommandState("bold"));
  };
  const emphasize = () => {
    field.current?.focus();
    document.execCommand("styleWithCSS", false, "false");
    document.execCommand("bold");
    update();
  };
  return <div className="overflow-hidden rounded-md border bg-background focus-within:ring-2 focus-within:ring-ring">
    <div className="flex items-center gap-2 border-b bg-muted/40 px-2 py-1">
      <Button type="button" size="sm" variant={bold ? "secondary" : "ghost"} disabled={disabled} aria-label="강조" aria-pressed={bold}
        onMouseDown={event => event.preventDefault()} onClick={emphasize}><Bold className="mr-1 h-4 w-4" />강조</Button>
      <span className="text-xs text-muted-foreground">글자를 선택해 강조하세요</span>
    </div>
    <div ref={field} id={id} role="textbox" aria-label={label} aria-multiline="true" aria-invalid={invalid}
      aria-describedby={invalid ? `${id}-error` : undefined} contentEditable={!disabled} suppressContentEditableWarning
      data-em={em} className="site-text-editor min-h-20 whitespace-pre-wrap break-words p-3 text-sm leading-relaxed outline-none"
      onFocus={onFocus} onInput={update} onKeyUp={() => setBold(document.queryCommandState("bold"))} onMouseUp={() => setBold(document.queryCommandState("bold"))}
      onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; update(); }}
      onKeyDown={event => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b") { event.preventDefault(); emphasize(); } }}
      onPaste={event => { event.preventDefault(); document.execCommand("insertText", false, event.clipboardData.getData("text/plain")); update(); }}
      onDrop={event => { event.preventDefault(); }} />
  </div>;
}
