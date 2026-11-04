import { useRef, useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ChevronRight, Building2, Trees, Sprout, Users } from "lucide-react";
import { copy } from "@/content/copy";
import { useSiteImage } from "@/hooks/useSiteImage";
import { ParallaxImage, Reveal, Stagger } from "@/components/site/motion";
import { BrandSpinner } from "@/components/site/SiteLoader";
import { apiRequest } from "@/lib/queryClient";
import { FloatingInput, FloatingTextarea, SuccessCheck, proposalSchema, requestError, type ProposalValues } from "./support/FormParts";
import "./support/team-c.css";

export default function B2B() {
  const image = useSiteImage("b2b.hero");
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
  return <div className="team-c c-b2b">
    <section className="c-b2b-hero c-wrap">
      <Reveal className="c-b2b-heading"><p className="c-eyebrow">B2B 협업</p><h1>{copy.b2b.hero.title}</h1><p className="c-intro-lead">{copy.b2b.hero.lead}</p><a href="#proposal" className="c-text-link">프로젝트 이야기 나누기 <ArrowDown size={17} aria-hidden="true" /></a></Reveal>
      <ParallaxImage src={image.url} alt={image.alt} containerClassName="c-b2b-hero-photo" strength={5} />
    </section>
    <section className="c-fields-section c-wrap" aria-labelledby="fields-title"><Reveal><h2 id="fields-title" className="c-heading">비즈니스에 맞는<br />초록의 가능성.</h2></Reveal>
      <Stagger className="c-b2b-fields">{copy.b2b.fields.map((field, i) => { const Icon = [Building2, Trees, Sprout, Users][i]; return <Reveal key={field.title} className="c-b2b-field"><Icon size={34} strokeWidth={1.3} aria-hidden="true" /><h3>{field.title}</h3><p>{field.lead}</p></Reveal>; })}</Stagger>
    </section>
    <section id="proposal" className="c-proposal-section"><div className="c-wrap c-proposal-grid">
      <div className="c-proposal-intro"><p className="c-eyebrow">함께할 다음 프로젝트</p><h2>{copy.b2b.form.title}</h2><p>아직 구체적이지 않아도 괜찮습니다.<br />생각하고 계신 공간과 일정을 들려주세요.</p><a className="c-text-link" href="mailto:simda@simda.kr">simda@simda.kr <ChevronRight size={16} aria-hidden="true" /></a></div>
      {submitted ? <div className="c-proposal-form c-success" id="proposal-success" tabIndex={-1} role="status"><SuccessCheck /><h3>제안이 도착했습니다.</h3><p>{copy.b2b.form.success}</p><dl className="c-summary"><div><dt>회사</dt><dd>{submitted.companyName}</dd></div><div><dt>담당자</dt><dd>{submitted.contactName}</dd></div><div><dt>회신 이메일</dt><dd>{submitted.email}</dd></div></dl><Link href="/support" className="c-text-link">고객센터로 돌아가기 <ChevronRight size={16} aria-hidden="true" /></Link></div>
      : <form className="c-proposal-form" noValidate onSubmit={form.handleSubmit(send)} aria-label="B2B 협업 제안" aria-busy={mutation.isPending}>
        <p className="c-form-note">* 필수 입력 항목</p><fieldset disabled={mutation.isPending}>
          <div className="c-form-grid"><FloatingInput label="회사명" autoComplete="organization" required {...form.register("companyName")} error={errors.companyName?.message} /><FloatingInput label="담당자 이름" autoComplete="name" required {...form.register("contactName")} error={errors.contactName?.message} /><FloatingInput label="연락처" type="tel" autoComplete="tel" required {...form.register("phone")} error={errors.phone?.message} /><FloatingInput label="이메일" type="email" autoComplete="email" required {...form.register("email")} error={errors.email?.message} /></div>
          <FloatingInput label="사업 분야 (선택)" {...form.register("businessField")} error={errors.businessField?.message} hint="예: IT, 금융, 리테일, 문화·예술" />
          <FloatingTextarea label="제안 내용" required rows={6} maxLength={10000} {...form.register("proposalContent")} error={errors.proposalContent?.message} hint="공간, 희망 일정, 협업 내용을 20자 이상 적어 주세요." />
        </fieldset>
        {mutation.isError && <p className="c-form-error" role="alert">{requestError(mutation.error)}</p>}
        <button className="c-button c-submit" type="submit" disabled={mutation.isPending}>{mutation.isPending ? <><BrandSpinner label="제안 접수 중" /> 제안 접수 중</> : <>{copy.b2b.form.submit}<ChevronRight size={18} aria-hidden="true" /></>}</button>
        <p className="c-hint">입력하신 연락처로 협업 제안에 관해 안내드립니다.</p>
      </form>}
    </div></section>
  </div>;
}
