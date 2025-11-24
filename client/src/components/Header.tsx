import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ExternalLink } from "lucide-react";
import { useState } from "react";
import simdaLogo from "@assets/simda_logo_green_1763991528464.png";

const navigation = [
  { name: "홈", href: "/" },
  { name: "브랜드 스토리", href: "/about" },
  { name: "서비스", href: "/services" },
  { name: "포트폴리오", href: "/portfolio" },
  { name: "매거진", href: "/magazine" },
  { name: "B2B 협업", href: "/b2b" },
  { name: "온라인샵", href: "https://simgo.kr/", external: true },
  { name: "예약/상담", href: "/booking" },
  { name: "고객센터", href: "/support" },
];

export function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return location === href;
    return location.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/">
            <div data-testid="link-home-logo" className="hover-elevate active-elevate-2 px-2 py-1 rounded-md -ml-2 cursor-pointer">
              <img src={simdaLogo} alt="SIMDA" className="h-10 w-auto" />
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              item.external ? (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`link-${item.name.toLowerCase()}`}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md hover-elevate active-elevate-2"
                >
                  {item.name}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <Link key={item.name} href={item.href}>
                  <div
                    data-testid={`link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className={`px-3 py-2 text-sm font-medium rounded-md hover-elevate active-elevate-2 cursor-pointer ${
                      isActive(item.href) ? "bg-accent text-accent-foreground" : "text-foreground"
                    }`}
                  >
                    {item.name}
                  </div>
                </Link>
              )
            ))}
          </nav>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                <Menu className="h-5 w-5" />
                <span className="sr-only">메뉴 열기</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <nav className="flex flex-col space-y-1 mt-8">
                {navigation.map((item) => (
                  item.external ? (
                    <a
                      key={item.name}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`mobile-link-${item.name.toLowerCase()}`}
                      className="flex items-center justify-between px-4 py-3 text-base font-medium rounded-md hover-elevate active-elevate-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : (
                    <Link key={item.name} href={item.href}>
                      <div
                        data-testid={`mobile-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                        className={`block px-4 py-3 text-base font-medium rounded-md hover-elevate active-elevate-2 cursor-pointer ${
                          isActive(item.href) ? "bg-accent text-accent-foreground" : "text-foreground"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </div>
                    </Link>
                  )
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
