import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import * as Popover from "@radix-ui/react-popover";
import { ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { siteEase } from "./motion";

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
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const desktop = window.matchMedia("(min-width: 734px)");
    const onResize = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", onResize);
    return () => { window.removeEventListener("scroll", onScroll); desktop.removeEventListener("change", onResize); };
  }, []);
  useEffect(() => { setOpen(false); setSupportOpen(false); }, [location]);
  const active = (href: string) => location === href || location.startsWith(`${href}/`);

  return (
    <>
      <a href="#site-main" className="site-skip">본문으로 건너뛰기</a>
      <header className="site-nav fixed inset-x-0 top-0 z-50" data-scrolled={scrolled}>
        <nav aria-label="주 메뉴" className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-6 tablet:px-10">
          <Link href="/" aria-label="simda 홈" className="flex h-full items-center text-site-green"><Logo variant="full" className="w-[80px]" /></Link>
          <ul className="hidden h-full items-center gap-6 text-site-caption-size desktop:gap-10 tablet:flex">
            {siteLinks.map(({ href, label }) => (
              <li key={href} className="flex items-center gap-1">
                <Link href={href} aria-current={active(href) ? "page" : undefined} className="py-3 hover:text-site-link">{label}</Link>
                {href === "/support" && (
                  <Popover.Root open={supportOpen} onOpenChange={setSupportOpen}>
                    <Popover.Trigger aria-label="고객센터 하위 메뉴" className="flex h-8 w-6 items-center justify-center"><ChevronDown size={12} /></Popover.Trigger>
                    <Popover.Portal>
                      <Popover.Content align="end" sideOffset={12} className="site-shell z-[60] min-w-48 rounded-site-card border border-black/10 bg-white/95 p-3 backdrop-blur-xl">
                        <nav aria-label="고객센터 하위 메뉴" className="flex flex-col text-sm">
                          {supportLinks.map((link) => <Link key={link.href} href={link.href} onClick={() => setSupportOpen(false)} className="rounded-site-input px-4 py-3 hover:bg-site-surface">{link.label}</Link>)}
                        </nav>
                      </Popover.Content>
                    </Popover.Portal>
                  </Popover.Root>
                )}
              </li>
            ))}
            <li><a href="https://www.simda.me" target="_blank" rel="noopener noreferrer" aria-label="온라인샵 (새 창)" className="py-3 hover:text-site-link">온라인샵 ↗</a></li>
          </ul>
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild><button type="button" aria-label="메뉴 열기" className="flex h-11 w-11 items-center justify-center tablet:hidden"><Menu size={21} strokeWidth={1.5} /></button></Dialog.Trigger>
            <Dialog.Portal forceMount>
              <AnimatePresence>
                {open && (
                  <Dialog.Content forceMount asChild aria-describedby={undefined}>
                    <motion.div data-lenis-prevent className="site-shell fixed inset-0 z-[70] overflow-y-auto bg-site-white px-6 pb-10" initial={{ opacity: reduce ? 1 : 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.2 }}>
                      <Dialog.Title className="sr-only">simda 전체 메뉴</Dialog.Title>
                      <div className="flex h-12 items-center justify-between">
                        <Link href="/" aria-label="simda 홈" onClick={() => setOpen(false)}><Logo variant="full" className="w-[80px] text-site-green" /></Link>
                        <Dialog.Close asChild><button type="button" aria-label="메뉴 닫기" className="flex h-11 w-11 items-center justify-center"><X size={23} strokeWidth={1.5} /></button></Dialog.Close>
                      </div>
                      <motion.nav aria-label="모바일 메뉴" className="mx-auto mt-12 max-w-lg" initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: reduce ? 0 : 0.08 } } }}>
                        {[...siteLinks, ...supportLinks, { href: "https://www.simda.me", label: "온라인샵 ↗" }].map(({ href, label }) => (
                          <motion.div key={href} variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.3, ease: siteEase } } }}>
                            {href.startsWith("https:") ? <a href={href} target="_blank" rel="noopener noreferrer" aria-label="온라인샵 (새 창)" onClick={() => setOpen(false)} className="mt-6 block py-3 text-site-subtitle text-site-link">{label}</a> : <Link href={href} onClick={() => setOpen(false)} aria-current={active(href) ? "page" : undefined} className={`block py-3 font-semibold ${href.startsWith("/support/") ? "pl-4 text-lg text-site-secondary" : "text-site-subtitle"}`}>{label}</Link>}
                          </motion.div>
                        ))}
                      </motion.nav>
                    </motion.div>
                  </Dialog.Content>
                )}
              </AnimatePresence>
            </Dialog.Portal>
          </Dialog.Root>
        </nav>
      </header>
    </>
  );
}
