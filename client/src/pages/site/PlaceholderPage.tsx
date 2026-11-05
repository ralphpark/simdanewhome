import { useEffect } from "react";
import { Link } from "wouter";
import { PageHead, Subpage, WaysCards } from "@/components/site/PagePrimitives";
import type { SiteImageKey } from "@/content/images";
import "./support/team-c.css";

export function PlaceholderPage({ title, imageKey, eyebrow = "simda", detailId }: { title: string; imageKey: SiteImageKey; eyebrow?: string; detailId?: string }) {
  useEffect(() => { document.title = `${title} — simda`; }, [title]);
  return <Subpage className="c-placeholder"><div data-page-id={detailId}><PageHead eyebrow={eyebrow} title={title} intro="식물과 함께하는 일상의 큐레이션." imageKey={imageKey} /></div><WaysCards /></Subpage>;
}

export function SiteNotFound() {
  useEffect(() => { document.title = "페이지를 찾을 수 없습니다 — simda"; }, []);
  return <Subpage className="c-not-found"><PageHead eyebrow="404" title={<>페이지를<br />찾을 수 없습니다.</>} intro="주소가 변경되었거나 더 이상 제공되지 않는 페이지입니다." actions={<><Link href="/" className="btn">홈으로 돌아가기</Link><Link href="/support" className="btn btn-o">고객센터</Link></>} /><WaysCards /></Subpage>;
}
