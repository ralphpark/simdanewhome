# 홈 v2 구현 및 검수 기록

승인 기준: `mockup/home.dc.html`. 화면 비교 기준: `verification/motion/index.html`.

공통 껍데기와 홈 구현 및 브라우저 검수는 끝났다. **전체 `npm run check`는 기존 코드의 타입 오류 15개 때문에 실패한다. 따라서 전체 완료 조건은 아직 충족하지 않았다.** 공개 사이트 코드 범위의 별도 타입 검사와 프론트 빌드는 통과했다.

## 변경 파일

| 파일 | 변경 내용 |
| --- | --- |
| `client/src/components/site/SiteNav.tsx` | 52px 한 줄 sticky 헤더, 현재 페이지 표시, 예약상담, Dialog 전체 메뉴, 고객센터 Popover. |
| `client/src/components/site/SiteFooter.tsx` | 시안의 4열/모바일 2열 푸터와 `brand.ts` 사업자·연락처 연결. |
| `client/src/components/site/SiteLoader.tsx` | 기본 숨김, 세션 첫 진입 한 번의 2.7초 로고 조립, 동작 줄이기 설정 대응. |
| `client/src/components/site/SiteLayout.tsx` | 고정 헤더용 상단 여백 제거, transform 없는 opacity 페이지 전환, Lenis 유지. |
| `client/src/styles/tokens.css` | 시안 토큰·타이포그래피·버튼·헤더·푸터·로더와 모바일 메뉴 스타일. |
| `client/src/content/brand.ts` | 기존 푸터의 사업자번호·주소·연락처를 회사 정보에 통합. |
| `client/src/content/images.ts` | 홈 로컬 사진 기본값과 8개 추가 이미지 키; 관리자·서버가 같은 키 목록을 재사용. |
| `client/src/pages/site/Home.tsx` | 새 홈 구성과 기존 SEO 제목 연결. |
| `client/src/pages/site/home/sections.tsx` | 승인 시안의 화면·문구·SVG를 JSX로 이식, 내부 Link와 이미지 훅 연결. |
| `client/src/pages/site/home/content.tsx` | 기존 포트폴리오·매거진 훅, 대표/최신 항목 및 상세 링크, 빈 데이터 대체 카드, 기존 고객사 목록 연결. |
| `client/src/pages/site/home/home.css` | 홈 범위의 원본 CSS 모션·반응형 이식, 캔버스 규칙 제거, Tailwind 기본 스타일 차이 보정. |
| `client/src/pages/site/home/vite.verify.config.mts` | 환경 파일을 불러오지 않는 프론트 빌드 경로 지정. |
| `client/src/pages/site/home/verify-v2.mjs` | 오프라인 Chrome 캡처, 가짜 API, 원본 비교, 메뉴·로더·데이터·반응형 검수. |
| `tsconfig.json` | 접근 금지된 마이그레이션 파일을 컴파일러 입력에서 명시적으로 제외. |
| `docs/redesign/HOME-V2-IMPLEMENTATION.md` | 변경 내용, 차이, 검수 증거와 남은 타입 오류 기록. |

작업 시작 전부터 변경되어 있던 `copy.ts`, `Services.tsx`, `PLAN.md`와 제공된 시안·사진은 이번 작업에서 수정하지 않았다. 하위 페이지 본문, 관리자 로직, 예약·B2B 폼, API 라우트, DB 스키마는 수정하지 않았다.

## 시안과 다른 부분 및 이유

- 하위 메뉴가 실제로 동작하도록 고객센터 옆 작은 펼침 버튼과 흰 유리 Popover를 추가했다. 모바일은 Radix Dialog를 이용한 전체 메뉴로 구현했다.
- 현재 페이지 표시, 키보드 포커스, 내부 wouter Link, 새 창 링크를 실제 사이트 동작에 맞게 연결했다.
- 포트폴리오 3장과 매거진 3장은 기존 API 데이터가 있으면 대표/최신 항목을 표시한다. 비공개·미래 게시물은 기존 `newestPosts` 규칙에 따라 제외한다. 데이터가 없거나 로딩·오류이면 시안 카드가 표시된다. 고객사 이름은 요청대로 기존 `brand.ts` 목록을 쓴다.
- 확인용 HTML에 내장된 축소 사진 대신 지정된 로컬 JPEG를 사용하므로 실제 사진이 더 선명하다. 구도와 배치는 같다.
- 로더는 매번 재생하는 시안과 달리 세션당 첫 진입에 한 번만 나온다. 동작 줄이기 설정에서는 표시하지 않는다.
- CSS 선택자와 키프레임, SVG ID에 범위를 적용했다. 화면 수치·모션 구간은 유지했다. Tailwind의 box sizing 및 제목 자간이 시안 값을 덮지 않도록 보정했다.

## 검수 결과

- **통과:** `vite build --config client/src/pages/site/home/vite.verify.config.mts`.
- **통과:** 공개 사이트 범위 `tsc -p docs/redesign/verification/home-v2/tsconfig.frontend.json`.
- **통과:** `node client/src/pages/site/home/verify-v2.mjs`.
- **통과:** `node client/src/pages/site/home/verify-v2.mjs --edges`.
- **통과:** `git diff --check`; 스크린샷 폴더 git 제외 확인.
- **미통과:** 전체 `npm run check` — 아래의 기존 타입 오류 15개. 오류가 발생한 파일과 스키마는 git 기준으로 변경되지 않았다. 금지 범위에 포함된 폼·서버 동작을 바꾸지 않고 이번 홈 작업 범위를 유지했다.

1440×900과 390×844 각각에서 14개 홈 장면을 원본과 같은 스크롤 위치로 캡처했다. 첫 화면, 사진 확장 중간/끝, 하이라이트, 몰입 사진, 숫자, 플랫폼 4단계, 포트폴리오, 매거진, 서명, 푸터를 포함한다. 이미지를 직접 열어 비교했다. 측정한 주요 14개 요소의 위치·크기·글자 크기·배경색이 두 크기 모두 일치했고, 첫 화면 및 플랫폼 각 단계의 opacity/transform/clip-path/카운트 값도 비교했다. 사진 압축과 시간 기반 pulse/shimmer의 재생 시점에 의한 픽셀 차이는 있을 수 있다.

6개 하위 페이지(`/story`, `/services`, `/portfolio`, `/magazine`, `/support`, `/support/booking`)를 두 크기에서 첫 화면과 푸터까지 캡처했다. 가로 넘침과 런타임 예외는 없었다.

추가 확인: sticky 헤더, 모바일 열림/닫힘/ESC, Tab 포커스 가두기와 트리거 복귀, 내부 이동 후 transform 없음, 데스크톱 Popover 반경 18px/ESC, 734/735/1068px 경계 폭, 높이 780px의 휴대폰 축소, 로더 첫 진입/재진입/동작 줄이기, 관리자 이미지 교체, 대표 포트폴리오와 공개 최신 글 상세 링크, API 오류 대체 카드, 중복 SVG ID 없음. 스크롤 모션 규칙을 브라우저에서 제거한 상태에서도 완성된 플랫폼 화면과 숫자 기본값을 확인했다.

검수 중 API 서버를 실행하지 않았다. 외부 요청은 브라우저에서 차단했으며, 하위 페이지의 기존 외부 이미지는 검수용 로컬 사진 응답으로 대체했다. 실제 API·DB 내용 및 외부 사진 서비스의 상태는 이 검수의 대상이 아니다.

## 남은 전체 타입 오류

| 위치 | 개수 | 내용 |
| --- | ---: | --- |
| `client/src/pages/B2B.tsx:265` | 1 | 입력 값의 null 타입 불일치. |
| `client/src/pages/Magazine.tsx:23` | 1 | 현재 컴파일 target에서 Set 전개 불가. |
| `client/src/pages/PlantCareConsultation.tsx:76` | 1 | 메시지 role 문자열 타입 불일치. |
| `client/src/pages/Portfolio.tsx:8` 및 `:21` | 4 | 없는 ScrollArea export 3개와 Set 전개 오류. |
| `server/storage.ts:174` 등 | 8 | 저장 객체의 필수 필드 누락 및 optional/null 타입 불일치. |

## 결과 파일

모두 git에서 제외되는 `docs/redesign/verification/home-v2/` 안에 있다.

- `index.html`: 구현/시안 스크린샷을 나란히 보는 갤러리.
- `home-{1440,390}-*.png`, `reference-{1440,390}-*.png`: 같은 위치의 홈 비교.
- `page-{1440,390}-*.png`: 하위 페이지 첫 화면 및 푸터.
- `menu-390-open.png`, `loader-assembly.png`, `boundary-*.png`, `popover-1440.png`, `platform-short-780.png`, `static-platform.png`: 추가 검수.
- `browser-report.json`, `edge-report.json`: 실제 브라우저 검사·측정 결과.
- `build.log`, `frontend-typecheck.log`, `typecheck.log`: 빌드와 타입 검사 로그.

커밋·푸시·배포는 수행하지 않았다.
