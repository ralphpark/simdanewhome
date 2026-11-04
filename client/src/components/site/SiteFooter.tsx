import { Link } from "wouter";
import { Logo } from "./Logo";
import { siteLinks, supportLinks } from "./SiteNav";

export function SiteFooter() {
  return (
    <footer className="bg-site-surface py-12 text-site-caption-size text-site-secondary">
      <div className="site-container">
        <Link href="/" aria-label="simda 홈" className="inline-block text-site-green"><Logo variant="full" className="w-24" /></Link>
        <div className="my-8 grid grid-cols-2 gap-8 tablet:grid-cols-4">
          <nav aria-label="심다 알아보기"><h2 className="mb-4 text-site-ink">심다 알아보기</h2><ul className="space-y-3">{siteLinks.slice(0, 4).map((link) => <li key={link.href}><Link href={link.href} className="hover:underline">{link.label}</Link></li>)}</ul></nav>
          <nav aria-label="고객지원"><h2 className="mb-4 text-site-ink">고객지원</h2><ul className="space-y-3">{[{ href: "/support", label: "고객센터" }, ...supportLinks].map((link) => <li key={link.href}><Link href={link.href} className="hover:underline">{link.label}</Link></li>)}</ul></nav>
          <nav aria-label="온라인샵"><h2 className="mb-4 text-site-ink">온라인샵</h2><a href="https://www.simda.me" target="_blank" rel="noopener noreferrer" className="hover:underline" aria-label="simda.me (새 창)">simda.me ↗</a></nav>
          <div><h2 className="mb-4 text-site-ink">문의</h2><p><a href="tel:15510525" className="hover:underline">1551-0525</a></p><p className="mt-3"><a href="mailto:simda@simda.kr" className="hover:underline">simda@simda.kr</a></p><p className="mt-3">평일 09:00–18:00</p></div>
        </div>
        <div className="border-t border-black/10 pt-6 leading-relaxed">
          <p>주식회사 에스아이엠지오 <span className="mx-2 hidden tablet:inline" aria-hidden="true">|</span><span className="block tablet:inline">사업자등록번호 574-88-02211</span></p>
          <address className="mt-1 not-italic">서울특별시 서초구 바우뫼로6길 22, 2층 1호</address>
          <p className="mt-4">© {new Date().getFullYear()} simda. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
