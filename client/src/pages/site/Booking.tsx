import { useRef, useState } from "react";
import { Link } from "wouter";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Check, ChevronLeft, ChevronRight, Sprout, Trees, ShoppingBag, MessageCircle, Users } from "lucide-react";
import { copy } from "@/content/copy";
import { PageHead, Subpage } from "@/components/site/PagePrimitives";
import { BrandSpinner } from "@/components/site/SiteLoader";
import { siteEase } from "@/components/site/motion";
import { apiRequest } from "@/lib/queryClient";
import { FloatingInput, FloatingTextarea, SuccessCheck, bookingSchema, isAvailableDate, requestError, type BookingValues } from "./support/FormParts";
import { BookingCalendarDay } from "./support/BookingCalendar";
import "./support/team-c.css";

const stepTitles = ["어떤 상담이 필요하세요?", "언제 이야기 나눌까요?", "연락받으실 분을 알려주세요.", "마지막으로 확인해 주세요."];
const times = Array.from({ length: 8 }, (_, i) => `${i + 10}:00`);
const typeIcons = [Sprout, Users, Trees, ShoppingBag, MessageCircle];
const stepFields: FieldPath<BookingValues>[][] = [["consultationType"], ["preferredDate", "preferredTime"], ["name", "phone", "email", "message"], []];

function BookingSummary({ values }: { values: Partial<BookingValues> }) {
  return <dl className="c-summary">
    <div><dt>상담 유형</dt><dd>{copy.booking.types.find((type) => type.value === values.consultationType)?.label}</dd></div>
    <div><dt>희망 일정</dt><dd>{values.preferredDate ? format(values.preferredDate, "yyyy년 M월 d일 (EEE)", { locale: ko }) : ""}<br />{values.preferredTime}</dd></div>
    <div><dt>이름</dt><dd>{values.name}</dd></div>
    <div><dt>연락처</dt><dd>{values.phone}</dd></div>
    <div><dt>이메일</dt><dd>{values.email}</dd></div>
    {values.message && <div><dt>메시지</dt><dd className="c-summary-message">{values.message}</dd></div>}
  </dl>;
}

export default function Booking() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitted, setSubmitted] = useState<BookingValues | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const focusStep = useRef(false);
  const submitLock = useRef(false);
  const queryClient = useQueryClient();
  const form = useForm<BookingValues>({ resolver: zodResolver(bookingSchema), mode: "onTouched", reValidateMode: "onChange", shouldUnregister: false, defaultValues: { name: "", phone: "", email: "", preferredTime: "", message: "" } });
  const values = form.watch();
  const errors = form.formState.errors;
  const mutation = useMutation({
    mutationFn: (data: BookingValues) => apiRequest("POST", "/api/bookings", data),
    onSuccess: (_, data) => {
      setSubmitted(data);
      void queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      requestAnimationFrame(() => {
        const panel = document.getElementById("booking-success");
        panel?.focus({ preventScroll: true });
        panel?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
      });
    },
    onSettled: () => { submitLock.current = false; },
  });
  const move = (next: number) => {
    setDirection(next > step ? 1 : -1);
    focusStep.current = true;
    setStep(next);
    mutation.reset();
  };
  const next = async () => {
    if (await form.trigger(stepFields[step], { shouldFocus: true })) move(step + 1);
  };
  const submit = form.handleSubmit((data) => {
    if (submitLock.current) return;
    submitLock.current = true;
    mutation.mutate(data);
  }, (fieldErrors) => {
    const invalidStep = stepFields.findIndex((fields) => fields.some((field) => field in fieldErrors));
    if (invalidStep >= 0) move(invalidStep);
  });
  return <Subpage className="team-c c-booking" passBar={false}>
    <PageHead eyebrow="심다와의 첫 대화" title={copy.booking.hero.title} intro={copy.booking.hero.lead} />
    <section className="c-booking-area">
      <div className="sp-wrap c-booking-layout">
      <div className="c-booking-panel">
        {submitted ? <div id="booking-success" className="c-booking-success c-success" tabIndex={-1} role="status"><SuccessCheck /><h2>{copy.booking.success.title}</h2><p>{copy.booking.success.lead}</p><BookingSummary values={submitted} /><p className="c-request-note">선택하신 일정은 희망 일정입니다.<br />담당자와 확인 후 상담 일정이 확정됩니다.</p><Link href="/support" className="btn">고객센터로 돌아가기 <ChevronRight size={18} aria-hidden="true" /></Link></div>
        : <>
          <ol className="c-booking-progress" aria-label="예약 진행 단계">{copy.booking.steps.map((label, i) => <li key={label} aria-current={step === i ? "step" : undefined} data-done={i < step}><span className="c-progress-dot">{i < step ? <Check size={14} aria-hidden="true" /> : i + 1}</span><span>{label}</span></li>)}</ol>
          <form noValidate onSubmit={(event) => { event.preventDefault(); if (step < 3) void next(); else void submit(event); }} aria-label="상담 예약" aria-busy={mutation.isPending}>
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div key={step} custom={direction} variants={{ enter: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * 32 }), active: { opacity: 1, x: 0 }, exit: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * -24 }) }} initial="enter" animate="active" exit="exit" transition={{ duration: reduce ? 0 : 0.24, ease: siteEase }} onAnimationComplete={() => { if (focusStep.current) { focusStep.current = false; heading.current?.focus({ preventScroll: true }); if (heading.current && heading.current.getBoundingClientRect().top < 60) heading.current.scrollIntoView({ behavior: reduce ? "instant" : "smooth", block: "start" }); } }}>
                <div className="c-step-heading"><p className="c-eyebrow">{String(step + 1).padStart(2, "0")} / 04</p><h2 ref={heading} tabIndex={-1}>{stepTitles[step]}</h2><p>{["가장 가까운 유형을 하나 골라 주세요.", "오늘 이후의 평일, 편하신 시간을 선택해 주세요.", "상담 일정을 안내받을 연락처를 적어 주세요.", "입력하신 내용으로 상담을 요청합니다."][step]}</p></div>
                {step === 0 && <fieldset className="c-type-options"><legend className="sr-only">상담 유형</legend>{copy.booking.types.map((type, i) => { const Icon = typeIcons[i]; return <label className="c-type-card" key={type.value}>
                  <input type="radio" value={type.value} {...form.register("consultationType")} aria-describedby={errors.consultationType ? "type-error" : undefined} /><Icon size={25} strokeWidth={1.4} aria-hidden="true" /><span><strong>{type.label}</strong><span>{type.lead}</span></span><span className="c-type-check"><Check size={13} aria-hidden="true" /></span>
                </label>; })}{errors.consultationType && <p className="c-field-error" id="type-error" role="alert">{errors.consultationType.message}</p>}</fieldset>}
                {step === 1 && <div className="c-date-step">
                  <div className="c-calendar"><DayPicker mode="single" locale={ko} formatters={{ formatCaption: (month) => format(month, "yyyy년 M월", { locale: ko }) }} selected={values.preferredDate} defaultMonth={values.preferredDate} onSelect={(date) => { if (date) { const selected = new Date(date); selected.setHours(12, 0, 0, 0); form.setValue("preferredDate", selected, { shouldValidate: true, shouldDirty: true }); } }} disabled={(date) => !isAvailableDate(date)} fromMonth={new Date()} weekStartsOn={0} showOutsideDays={false} labels={{ labelPrevious: () => "이전 달", labelNext: () => "다음 달" }} components={{ Day: BookingCalendarDay, IconLeft: () => <ChevronLeft size={20} />, IconRight: () => <ChevronRight size={20} /> }} /></div>
                  {errors.preferredDate && <p className="c-field-error" role="alert">{errors.preferredDate.message}</p>}
                  <fieldset className="c-time-options"><legend>희망 시간</legend><div>{times.map((time) => <label key={time}><input type="radio" value={time} {...form.register("preferredTime")} aria-describedby={errors.preferredTime ? "time-error" : undefined} /><span>{time}</span></label>)}</div>{errors.preferredTime && <p className="c-field-error" id="time-error" role="alert">{errors.preferredTime.message}</p>}</fieldset>
                  <p className="c-hint">희망 일정을 보내주시면 담당자가 가능 여부를 확인해 드립니다.</p>
                </div>}
                {step === 2 && <fieldset className="c-booking-contact"><legend className="sr-only">연락처 입력</legend><FloatingInput label="이름" required autoComplete="name" {...form.register("name")} error={errors.name?.message} /><FloatingInput label="연락처" required type="tel" autoComplete="tel" {...form.register("phone")} error={errors.phone?.message} /><FloatingInput label="이메일" required type="email" autoComplete="email" {...form.register("email")} error={errors.email?.message} /><FloatingTextarea label="미리 전할 이야기 (선택)" rows={4} maxLength={5000} {...form.register("message")} error={errors.message?.message} hint="공간이나 식물에 관해 궁금한 점을 자유롭게 남겨 주세요." /></fieldset>}
                {step === 3 && <><BookingSummary values={values} /><p className="c-request-note">담당자와 일정 확인 후 예약이 확정됩니다.<br />수정할 내용이 있다면 이전 단계로 돌아가 주세요.</p></>}
              </motion.div>
            </AnimatePresence>
            {mutation.isError && <p className="c-form-error" role="alert">{requestError(mutation.error)}</p>}
            <div className="c-booking-actions">{step > 0 && <button type="button" className="btn btn-o c-back-button" onClick={() => move(step - 1)} disabled={mutation.isPending}><ChevronLeft size={18} aria-hidden="true" /> 이전</button>}<button className="btn" type="submit" disabled={mutation.isPending}>{mutation.isPending ? <><BrandSpinner label="상담 요청 접수 중" /> 접수 중</> : <>{step < 3 ? "다음" : "상담 예약 요청"}<ChevronRight size={18} aria-hidden="true" /></>}</button></div>
          </form>
        </>}
      </div>
      </div>
    </section>
  </Subpage>;
}
