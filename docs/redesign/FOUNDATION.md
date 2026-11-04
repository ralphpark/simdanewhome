# 공통 기반 구현 기록

2026-11-04 · 페이지별 본문은 다음 단계에서 구현한다.

- 공개 경로는 `App.tsx`의 단일 `SiteLayout`을 공유한다. `pages/site`의 파일은 임시 페이지다.
- `/admin/*`, `/ai-curation`, `/plant-care-consultation`은 기존 Header/Footer 및 기존 페이지를 유지한다. 관리자 포스트의 `id` 전달만 wouter render prop에 맞췄다.
- 공개 디자인 토큰은 `--site-*`, Tailwind의 `site-*` 이름으로 분리했다. 기존 shadcn 변수 및 관리자 폰트는 유지한다.
- 폰트 크기 `text-site-caption-size`와 색상 `text-site-caption`은 이름을 구분한다. 캡션 색 `#86868B`는 작은 본문 대비 기준에 부족하므로 메뉴·푸터 본문에는 ink/secondary를 사용한다.
- 로고는 공식 `assets/brand/simda-logo.svg`의 path를 직접 읽어 재사용한다. 직접 추적한 워드마크/잎은 폐기했고, `full`/`emblem` 두 가지 variant 및 `currentColor`를 제공한다. 브랜드 그린은 `#03473E`다.
- 진입 로딩은 세션당 1회, 1.95초다. 받침선 scaleX(0.5초), 글자 spring 상승(0.07초 스태거), 엠블럼 회전, 확대/페이드 순서다. 공식 글자의 잘린 하단을 그대로 보존하며, 로딩에만 받침선 윗면을 기준으로 clipPath를 적용한다. 데이터 로딩에는 엠블럼을 회전하는 `BrandSpinner`를 쓴다. reduced-motion에서는 로딩·회전·Lenis·스크롤 연출을 생략한다.
- `Reveal`, `Stagger`, `ParallaxImage`, `ScaleOnScroll`, `CountUp`을 다음 페이지 구현에서 재사용한다. `Stagger` 안에는 `Reveal` 자식을 둔다.
- `useSiteImage(key)`는 DB 값 → 콘텐츠 기본값 순서를 사용한다. `images.ts`, `copy.ts`, `brand.ts`는 수정하지 않았다.

## 이미지 교체

`server/routes.ts`가 `registerSiteImageRoutes`를 등록한다. 공개 GET과 인증된 PUT/DELETE/Blob 토큰 발급을 분리했다.

- 이미지 키는 `images.ts`의 `siteImageKeys`에서 가져온다.
- URL은 HTTPS만 허용한다. JPG/PNG/WebP/GIF/AVIF, 최대 20MB, 임의 접미사를 사용한다.
- 클라이언트가 Blob에 직접 업로드한 뒤 PUT으로 저장한다. `onUploadCompleted` 콜백은 사용하지 않는다.
- 업로드 후 PUT이 실패하면 업로드한 URL을 유지하고 저장만 재시도한다.
- 기본값 복원은 DB 참조를 삭제한다. Blob 원본 삭제는 수행하지 않는다.
- `site_images` 마이그레이션은 실행하지 않았다. 운영 DB 반영 및 실제 Blob 업로드 검증은 연결 환경에서 필요하다.

## 검증

- `npx --no-install tsc --noEmit`: 기존 17개 → 15개, 새 오류 0개. App의 2개 라우트 타입 오류가 해결됐다.
- `npx --no-install vite build --config /tmp/simda-vite.config.mts`: 성공. 임시 설정은 기존 Vite 설정을 그대로 가져오고 `envDir`만 빈 임시 폴더로 지정해 `.env*`를 읽지 않았다.
- `node script/test-site-images.mjs`: 통과. 실제 MemStorage CRUD, 인증 미들웨어 연결, 키/URL 검사, Blob 권한/경로 제한, DB 실패 응답을 오프라인으로 검증했다.
- `script/check-site-foundation.mjs`: Vite preview + 임시 프로필의 headless Chrome에서 통과. `/`, `/story` 1440/390px, 공개 경로, 리다이렉트, 메뉴 포커스/Esc, 스크롤 복귀, reduced-motion, JS 예외를 확인했다.
- `verification/`에 스크린샷 및 브라우저 결과를 보관했다. 홈·스토리의 실제 기본 이미지 로딩과 가로 넘침 없음을 확인하고 직접 화면을 검수했다.
- 추가 브라우저 검사에서 첫 진입 로딩 약 1.82초, 세션 재사용, 관리자 이미지 카드 15개, 잘못된 파일의 사전 차단, 관리자/AI 기존 레이아웃을 확인했다. 관리자 API는 가짜 응답이며 실제 DB/Blob 성공을 의미하지 않는다(`verification/extended-report.json`).
- 빌드에 Browserslist 데이터 노후화 및 기존 PostCSS `from` 경고가 남는다.
- 새 패키지 설치, DB 마이그레이션, 배포, 커밋/푸시는 실행하지 않았다.

## 공식 로고 교체 검수

- `script/check-site-logo.mjs`는 원본 SVG path 문자열과 Nav/Footer/Loader의 DOM path를 비교한다. 원본 파일은 변경하지 않는다.
- RAF/performance 시계와 CSS animation currentTime을 검수 브라우저에만 고정해 0.3/0.8/1.3/1.8초를 캡처했다. 프로덕션 코드에는 검수용 훅을 추가하지 않았다.
- 엠블럼 회전 중심이 고정되는지 수치로 확인하고, 글자 순차 상승 및 페이드 이미지를 직접 확인했다.
- `verification/loader-*.png`, `nav-1440.png`, `nav-390.png`, `logo-report.json`에 최신 결과를 저장했다. 기존 홈·스토리·모바일 메뉴 이미지도 새 로고로 덮어썼다.
- 이번 변경의 타입 검사는 기존 15개/신규 0개이며 Vite production build가 성공했다. `.verification-tmp/vite.config.mts`에서 빈 envDir을 지정해 비밀 파일 없이 빌드했다.
- 실제 브라우저 시간으로 로딩 종료 약 1.945초를 확인했다. BrandSpinner 3.2초 회전과 reduced-motion 즉시 정지도 확인했다(관리자 API는 가짜 응답).
