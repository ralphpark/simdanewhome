import { Link } from "wouter";
import { Instagram, Youtube, Facebook } from "lucide-react";
import simdaLogo from "@assets/simda_logo_green_1763991528464.png";

export function Footer() {
  return (
    <footer className="w-full border-t bg-card mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <img src={simdaLogo} alt="SIMDA" className="h-8 w-auto" />
            <p className="text-sm text-muted-foreground">
              식물과 함께하는<br />더 나은 공간
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">서비스</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/services#ai-curation">
                  <div data-testid="footer-link-ai-curation" className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">AI 식물 큐레이션</div>
                </Link>
              </li>
              <li>
                <Link href="/services#subscription">
                  <div data-testid="footer-link-subscription" className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">구독 관리</div>
                </Link>
              </li>
              <li>
                <Link href="/services#education">
                  <div data-testid="footer-link-education" className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">식물 교육</div>
                </Link>
              </li>
              <li>
                <a
                  href="https://simda.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="footer-link-marketplace"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  지역 기반 마켓플레이스
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">회사</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about">
                  <div data-testid="footer-link-about" className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">브랜드 스토리</div>
                </Link>
              </li>
              <li>
                <Link href="/portfolio">
                  <div data-testid="footer-link-portfolio" className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">포트폴리오</div>
                </Link>
              </li>
              <li>
                <Link href="/b2b">
                  <div data-testid="footer-link-b2b" className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">B2B 협업</div>
                </Link>
              </li>
              <li>
                <Link href="/magazine">
                  <div data-testid="footer-link-magazine" className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">매거진</div>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">고객지원</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/support">
                  <div data-testid="footer-link-support" className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">FAQ</div>
                </Link>
              </li>
              <li>
                <Link href="/booking">
                  <div data-testid="footer-link-booking" className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">예약/상담</div>
                </Link>
              </li>
              <li>
                <a
                  href="https://simgo.kr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="footer-link-shop"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  온라인샵
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SIMDA. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com/simda"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="social-instagram"
              className="text-muted-foreground hover:text-foreground hover-elevate active-elevate-2 p-2 rounded-md"
            >
              <Instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </a>
            <a
              href="https://youtube.com/@simda"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="social-youtube"
              className="text-muted-foreground hover:text-foreground hover-elevate active-elevate-2 p-2 rounded-md"
            >
              <Youtube className="h-5 w-5" />
              <span className="sr-only">YouTube</span>
            </a>
            <a
              href="https://facebook.com/simda"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="social-facebook"
              className="text-muted-foreground hover:text-foreground hover-elevate active-elevate-2 p-2 rounded-md"
            >
              <Facebook className="h-5 w-5" />
              <span className="sr-only">Facebook</span>
            </a>
          </div>

          <div className="flex gap-4">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
              개인정보처리방침
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
              이용약관
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
