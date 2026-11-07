import { useEffect, useState, type CSSProperties } from "react";
import { Link, useLocation } from "wouter";
import * as Dialog from "@radix-ui/react-dialog";
import * as Popover from "@radix-ui/react-popover";
import { ChevronDown, X } from "lucide-react";
import { Logo } from "./Logo";

export const siteLinks = [
  { href: "/story", label: "브랜드 스토리" },
  { href: "/services", label: "서비스" },
  { href: "/portfolio", label: "포트폴리오" },
  { href: "/magazine", label: "매거진" },
  { href: "/support", label: "고객센터" },
] as const;
export const supportLinks = [{ href: "/support/b2b", label: "B2B 협업" }, { href: "/support/booking", label: "예약상담" }] as const;

export function SiteNav() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  useEffect(() => { setOpen(false); setSupportOpen(false); }, [location]);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 735px)");
    const close = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", close);
    return () => desktop.removeEventListener("change", close);
  }, []);
  const active = (href: string) => location === href || location.startsWith(`${href}/`);
  return <>
    <a href="#site-main" className="site-skip">본문으로 건너뛰기</a>
    <header className="gn"><div className="gn-in">
      <Link className="gn-logo" href="/" aria-label="심다 홈"><Logo aria-hidden="true" /></Link>
      <nav className="gn-menu" aria-label="주 메뉴">
        {siteLinks.map(({ href, label }) => <div className="gn-item" key={href}>
          <Link href={href} aria-current={active(href) ? "page" : undefined}>{label}</Link>
          {href === "/support" && <Popover.Root open={supportOpen} onOpenChange={setSupportOpen}>
            <Popover.Trigger className="gn-sub-trigger" aria-label="고객센터 하위 메뉴"><ChevronDown size={10} /></Popover.Trigger>
            <Popover.Portal><Popover.Content align="end" sideOffset={20} className="site-shell gn-popover">
              <nav aria-label="고객센터 하위 메뉴">{supportLinks.map(link => <Link key={link.href} href={link.href} onClick={() => setSupportOpen(false)}>{link.label}</Link>)}</nav>
            </Popover.Content></Popover.Portal>
          </Popover.Root>}
        </div>)}
      </nav>
      <div className="gn-right">
        <a className="gn-shop" href="https://simgo.kr" target="_blank" rel="noopener">컴패션과 함께하는 ↗</a>
        <a className="gn-shop" href="https://www.simda.me" target="_blank" rel="noopener">SHOP ↗</a>
        <Link className="btn btn-sm" href="/support/booking">예약상담</Link>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild><button className="gn-burger" type="button" aria-label="메뉴 열기"><span /><span /></button></Dialog.Trigger>
          <Dialog.Portal><Dialog.Overlay className="gn-menu-overlay" /><Dialog.Content className="site-shell gn-mobile" aria-describedby={undefined} data-lenis-prevent>
            <Dialog.Title className="sr-only">simda 전체 메뉴</Dialog.Title>
            <div className="gn-mobile-top">
              <Link className="gn-logo" href="/" aria-label="심다 홈" onClick={() => setOpen(false)}><Logo aria-hidden="true" /></Link>
              <Dialog.Close asChild><button type="button" aria-label="메뉴 닫기"><X size={22} strokeWidth={1.5} /></button></Dialog.Close>
            </div>
            <nav aria-label="모바일 메뉴">{[...siteLinks, ...supportLinks].map((link, index) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} aria-current={active(link.href) ? "page" : undefined} className={index > 4 ? "gn-mobile-sub" : undefined} style={{ "--menu-index": index } as CSSProperties}>{link.label}</Link>)}
              <a className="gn-mobile-sub" style={{ "--menu-index": 7 } as CSSProperties} href="https://simgo.kr" target="_blank" rel="noopener" onClick={() => setOpen(false)}>컴패션과 함께하는 ↗</a>
              <a className="gn-mobile-sub" style={{ "--menu-index": 8 } as CSSProperties} href="https://www.simda.me" target="_blank" rel="noopener" onClick={() => setOpen(false)}>SHOP ↗</a>
            </nav>
          </Dialog.Content></Dialog.Portal>
        </Dialog.Root>
      </div>
    </div></header>
  </>;
}
