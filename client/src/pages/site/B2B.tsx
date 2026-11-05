import { useRef, useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Building2, Trees, Sprout, Users } from "lucide-react";
import { copy } from "@/content/copy";
import { PageHead, PageSection, ScrollReveal, Subpage } from "@/components/site/PagePrimitives";
import { BrandSpinner } from "@/components/site/SiteLoader";
import { apiRequest } from "@/lib/queryClient";
import { FloatingInput, FloatingTextarea, SuccessCheck, proposalSchema, requestError, type ProposalValues } from "./support/FormParts";
import "./support/team-c.css";

export default function B2B() {
  const queryClient = useQueryClient();
  const [submitted, setSubmitted] = useState<ProposalValues | null>(null);
  const locked = useRef(false);
  const form = useForm<ProposalValues>({ resolver: zodResolver(proposalSchema), mode: "onTouched", reValidateMode: "onChange", defaultValues: { companyName: "", contactName: "", phone: "", email: "", businessField: "", proposalContent: "" } });
  const mutation = useMutation({
    mutationFn: (data: ProposalValues) => apiRequest("POST", "/api/b2b-proposals", data),
    onSuccess: (_, data) => {
      setSubmitted(data);
      void queryClient.invalidateQueries({ queryKey: ["/api/b2b-proposals"] });
      requestAnimationFrame(() => {
        const panel = document.getElementById("proposal-success");
        panel?.focus({ preventScroll: true });
        panel?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
      });
    },
    onSettled: () => { locked.current = false; },
  });
  const send = (data: ProposalValues) => { if (locked.current) return; locked.current = true; mutation.mutate(data); };
  const errors = form.formState.errors;
  return <Subpage className="team-c c-b2b">
    <PageHead eyebrow="B2B 협업" title={copy.b2b.hero.title} intro={copy.b2b.hero.lead} imageKey="b2b.hero" actions={<a href="#proposal" className="btn">프로젝트 이야기 나누기</a>} />
    <PageSection alt eyebrow="함께하는 비즈니스" title={<>비즈니스에 맞는<br />초록의 가능성.</>}>
      <div className="c-b2b-fields">{copy.b2b.fields.map((field, i) => { const Icon = [Building2, Trees, Sprout, Users][i]; return <ScrollReveal key={field.title} className="c-b2b-field"><Icon size={44} strokeWidth={1.5} aria-hidden="true" /><h3>{field.title}</h3><p>{field.lead}</p></ScrollReveal>; })}</div>
    </PageSection>
    <section id="proposal" className="sp-section c-proposal-section"><div className="sp-wrap c-proposal-grid">
      <div className="c-proposal-intro"><p className="t-eye">함께할 다음 프로젝트</p><h2 className="t-h2">{copy.b2b.form.title}</h2><p className="t-intro">아직 구체적이지 않아도 괜찮습니다.<br />생각하고 계신 공간과 일정을 들려주세요.</p><a className="sp-link" href="mailto:simda@simda.kr">simda@simda.kr <span aria-hidden="true">›</span></a></div>
      {submitted ? <div className="c-proposal-form c-success" id="proposal-success" tabIndex={-1} role="status"><SuccessCheck /><h3>제안이 도착했습니다.</h3><p>{copy.b2b.form.success}</p><dl className="c-summary"><div><dt>회사</dt><dd>{submitted.companyName}</dd></div><div><dt>담당자</dt><dd>{submitted.contactName}</dd></div><div><dt>회신 이메일</dt><dd>{submitted.email}</dd></div></dl><Link href="/support" className="sp-link">고객센터로 돌아가기 <span aria-hidden="true">›</span></Link></div>
      : <form className="c-proposal-form" noValidate onSubmit={form.handleSubmit(send)} aria-label="B2B 협업 제안" aria-busy={mutation.isPending}>
        <p className="c-form-note">* 필수 입력 항목</p><fieldset disabled={mutation.isPending}>
          <div className="c-form-grid"><FloatingInput label="회사명" autoComplete="organization" required {...form.register("companyName")} error={errors.companyName?.message} /><FloatingInput label="담당자 이름" autoComplete="name" required {...form.register("contactName")} error={errors.contactName?.message} /><FloatingInput label="연락처" type="tel" autoComplete="tel" required {...form.register("phone")} error={errors.phone?.message} /><FloatingInput label="이메일" type="email" autoComplete="email" required {...form.register("email")} error={errors.email?.message} /></div>
          <FloatingInput label="사업 분야 (선택)" {...form.register("businessField")} error={errors.businessField?.message} hint="예: IT, 금융, 리테일, 문화·예술" />
          <FloatingTextarea label="제안 내용" required rows={6} maxLength={10000} {...form.register("proposalContent")} error={errors.proposalContent?.message} hint="공간, 희망 일정, 협업 내용을 20자 이상 적어 주세요." />
        </fieldset>
        {mutation.isError && <p className="c-form-error" role="alert">{requestError(mutation.error)}</p>}
        <button className="btn c-submit" type="submit" disabled={mutation.isPending}>{mutation.isPending ? <><BrandSpinner label="제안 접수 중" /> 제안 접수 중</> : <>{copy.b2b.form.submit}<ChevronRight size={18} aria-hidden="true" /></>}</button>
        <p className="c-hint">입력하신 연락처로 협업 제안에 관해 안내드립니다.</p>
      </form>}
    </div></section>
  </Subpage>;
}
