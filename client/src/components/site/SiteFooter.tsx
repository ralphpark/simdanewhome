import { Link } from "wouter";
import { company } from "@/content/brand";
import { Logo } from "./Logo";
import { siteLinks, supportLinks } from "./SiteNav";

export function SiteFooter() {
  return <footer className="ft"><div className="ft-in">
    <Link href="/" aria-label="심다 홈"><Logo className="ft-logo" /></Link>
    <div className="ft-cols">
      <nav aria-label="심다 알아보기"><h4>심다 알아보기</h4>{siteLinks.slice(0, 4).map(link => <Link href={link.href} key={link.href}>{link.label}</Link>)}</nav>
      <nav aria-label="고객지원"><h4>고객지원</h4>{[{ href: "/support", label: "고객센터" }, ...supportLinks].map(link => <Link href={link.href} key={link.href}>{link.label}</Link>)}</nav>
      <nav aria-label="온라인샵"><h4>온라인샵</h4><a href="https://www.simda.me" target="_blank" rel="noopener">simda.me ↗</a></nav>
      <div><h4>문의</h4><a href={`tel:${company.phone.replaceAll("-", "")}`}>{company.phone}</a><a href={`mailto:${company.email}`}>{company.email}</a><span>{company.hours}</span></div>
    </div>
    <div className="ft-bot"><span>{company.name} · 사업자등록번호 {company.registrationNumber} · {company.address}</span><span>Copyright © {new Date().getFullYear()} simda. 모든 권리 보유.</span></div>
  </div></footer>;
}
