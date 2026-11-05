import { forwardRef, useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import "./page-primitives.css";

type FieldProps = { label: string; error?: string; hint?: string };
export const FloatingInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldProps>(function FloatingInput({ label, error, hint, id: suppliedId, ...props }, ref) {
  const generated = useId(); const id = suppliedId ?? generated;
  return <div className="sp-field-block"><div className={`sp-floating ${error ? "sp-invalid" : ""}`}>
    <input {...props} ref={ref} id={id} placeholder=" " aria-invalid={!!error} aria-describedby={[props["aria-describedby"], error ? `${id}-error` : hint ? `${id}-hint` : ""].filter(Boolean).join(" ") || undefined} />
    <label htmlFor={id}>{label}{props.required ? " *" : ""}</label>
  </div>{error ? <p id={`${id}-error`} className="sp-field-error" aria-live="polite">{error}</p> : hint ? <p id={`${id}-hint`} className="sp-hint">{hint}</p> : null}</div>;
});
export const FloatingTextarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps>(function FloatingTextarea({ label, error, hint, id: suppliedId, ...props }, ref) {
  const generated = useId(); const id = suppliedId ?? generated;
  return <div className="sp-field-block"><div className={`sp-floating sp-floating-area ${error ? "sp-invalid" : ""}`}>
    <textarea {...props} ref={ref} id={id} placeholder=" " aria-invalid={!!error} aria-describedby={[props["aria-describedby"], error ? `${id}-error` : hint ? `${id}-hint` : ""].filter(Boolean).join(" ") || undefined} />
    <label htmlFor={id}>{label}{props.required ? " *" : ""}</label>
  </div>{error ? <p id={`${id}-error`} className="sp-field-error" aria-live="polite">{error}</p> : hint ? <p id={`${id}-hint`} className="sp-hint">{hint}</p> : null}</div>;
});
export function SuccessCheck() {
  return <div className="sp-success-check"><svg viewBox="0 0 56 56" fill="none" aria-hidden="true"><path pathLength="1" d="M15 28 24 37 42 19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg></div>;
}
