import { useEffect } from "react";
import { Link } from "wouter";
import { Reveal, ScaleOnScroll } from "@/components/site/motion";
import { Logo } from "@/components/site/Logo";
import { useSiteImage } from "@/hooks/useSiteImage";
import type { SiteImageKey } from "@/content/images";

/** Foundation preview only. Page-specific sections are implemented next. */
export function PlaceholderPage({ title, imageKey, eyebrow = "simda", detailId }: { title: string; imageKey: SiteImageKey; eyebrow?: string; detailId?: string }) {
  const image = useSiteImage(imageKey);
  useEffect(() => { document.title = `${title} — simda`; }, [title]);
  return (
    <article data-page-id={detailId}>
      <section className="site-container site-section text-center">
        <Reveal>
          <p className="mb-6 text-sm font-semibold text-site-green">{eyebrow}</p>
          <h1 className="site-hero-title mx-auto max-w-4xl whitespace-pre-line">{title}</h1>
          <p className="mx-auto mt-8 max-w-lg text-site-secondary">식물과 함께하는 일상의 큐레이션.</p>
        </Reveal>
      </section>
      <ScaleOnScroll className="pb-site-section" contentClassName="bg-site-surface">
        {image.url ? (
          <img src={image.url} alt={image.alt} loading="lazy" decoding="async" width="1920" height="1080" className="h-[56svh] min-h-72 max-h-[720px] w-full object-cover tablet:h-[72svh]" />
        ) : (
          <div className="flex h-[56svh] min-h-72 max-h-[720px] flex-col items-center justify-center gap-6 text-site-green tablet:h-[72svh]">
            <Logo variant="emblem" className="h-24 w-24" />
            <span className="text-sm">식물과 공간, 심다.</span>
          </div>
        )}
      </ScaleOnScroll>
    </article>
  );
}

export function SiteNotFound() {
  return <section className="site-container site-section text-center"><h1 className="site-headline">페이지를 찾을 수 없습니다.</h1><Link href="/" className="site-pill mt-8">홈으로 돌아가기</Link></section>;
}
