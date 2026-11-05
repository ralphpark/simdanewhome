# 2단계 구현 계획

## 기준과 보존 범위

승인된 `mockup/home.dc.html`과 1단계의 `tokens.css`, 헤더·푸터를 기준으로 한다. 홈 파일·화면은 동결하고 작업 전 파일 해시와 1단계 스크린샷으로 회귀를 확인한다. 하위 페이지에만 `.subpage` 범위를 적용한다. 흰색/`--alt`, 80/48/24/21/17px 글자, 128~144px 섹션 여백, 그린 알약, 28px 카드, 12px 사진 간격을 공유한다. API·DB·관리자·라우트와 폼 zod/제출 로직은 유지한다.

## 리드가 먼저 만드는 공통 부품

모든 부품은 `client/src/components/site/PagePrimitives.tsx`, `AppleFields.tsx`, `PlatformPhone.tsx`, `page-primitives.css`, `platform-phone.css`에 둔다. 기존 홈은 이 파일을 사용하도록 바꾸지 않는다.

| 부품 | props / 역할 |
| --- | --- |
| `Subpage` | `children`, `className?`, `passBar? = true`: 공통 범위와 상담 바. 예약만 false. |
| `PageHead` | `eyebrow`, `title`, `intro?`(ReactNode), `actions?`, `imageKey?`, `id?`, `className?`: 가운데 제목과 짧은 1600px 사진 확장 트랙. 사진 없으면 짧은 제목 구간. |
| `PhotoReveal` | `src`, `alt`, `caption?`, `className?`, `eager?`, `aspectRatio?`: 모서리 28 사진, CSS 확대 해제. |
| `PageSection` | `children`, `id?`, `eyebrow?`, `title?`, `intro?`, `alt?`, `center?`, `className?`: 128px/모바일80px 여백과 제목. |
| `ScrollReveal` | `children`, `className?`: CSS view timeline 글 떠오르기. |
| `SegmentedControl` | `options: {key,label}[]`, `value`, `onChange`, `label`: 반투명 알약, 움직이는 선택 표시, 라디오 키보드 패턴. |
| `Tiles` / `PhotoTile` | `items: {id,href,title,eyebrow?,description?,image,alt?}[]`, `className?`: 2열/모바일1열, 12px 간격. PhotoTile은 `item` 한 개. |
| `WaysCards` | `title?`, `intro?`, `items?`, `className?`: 홈의 예약·협업·샵 카드, 기본 3장. 항목은 `{title,lead,href,label,icon?: booking/business/shop}`. |
| `PassBar` | props 없음: 홈과 같은 유리 상담 바. 스크롤 후 표시. |
| `FloatingInput` / `FloatingTextarea` | native props + `label`, `error?`, `hint?`, forwarded ref: 높이56/모서리12/떠오르는 라벨/오류 연결. |
| `SuccessCheck` | props 없음: 완료 체크 선 그리기, reduced motion 정지. |
| `PlatformPhone` | props 없음: 홈 아이폰 도착 화면의 정지 사본. 별도 SVG ID 의존 없음. |

scroll-driven 규칙은 `@supports` 안에 두고 기본 상태는 정지·노출한다. `prefers-reduced-motion`에서 모두 끈다. 1068/734 반응형을 공통 CSS에서 담당한다. 공통 부품 구현 후 프론트 빌드가 통과해야 에이전트를 시작한다.

## 에이전트 분담과 파일 소유권

동시 실행 한도가 리드 포함 4이므로, 기존 화면 유틸리티를 공유하는 포트폴리오·매거진을 합쳐 **3개 에이전트**를 병렬 실행한다. 각 에이전트는 사용자 지시서 전체를 전달받고 자신이 소유한 파일만 수정한다. 공통 부품 변경은 리드에게 요청한다. 서로의 변경을 되돌리지 않는다.

| 담당 | 페이지 | 수정 가능한 파일 |
| --- | --- | --- |
| A: 브랜드·서비스 | `/story`, `/services` | `client/src/pages/site/Story.tsx`, `Services.tsx`, `story/sections.tsx`, `story/story.css`, `services/services.css` |
| B: 콘텐츠 | `/portfolio`, `/portfolio/:id`, `/magazine`, `/magazine/:id` | `client/src/pages/site/Portfolio.tsx`, `PortfolioDetail.tsx`, `Magazine.tsx`, `MagazineDetail.tsx`, `portfolio/portfolio.css`, `portfolio/shared.css`, `portfolio/ui.tsx`, `magazine/PostCard.tsx`, `magazine/magazine.css` |
| C: 고객센터·폼 | `/support`, `/support/b2b`, `/support/booking`, 404·Placeholder | `client/src/pages/site/Support.tsx`, `B2B.tsx`, `Booking.tsx`, `PlaceholderPage.tsx`, `support/team-c.css`, `support/FormParts.tsx`, `support/BookingCalendar.tsx`, `client/src/pages/not-found.tsx` |
| 리드 | 공통 부품·검수·타입 | 위 공통 파일, `client/src/content/images.ts`, `client/src/pages/site/verification/*`, 이 계획과 완료 보고서, 레거시 `client/src/pages/B2B.tsx`, `Magazine.tsx`, `Portfolio.tsx`, `PlantCareConsultation.tsx`, `server/storage.ts`의 타입만 |

에이전트별 검수 산출물은 git 제외된 `docs/redesign/verification/subpages-v2/agent-a/`, `agent-b/`, `agent-c/`로 분리한다. 데이터 훅·댓글·HTML 정화 로직·공통 tokens·헤더·푸터·홈은 에이전트 수정 금지. 폼 스키마와 API 요청 필드는 보존한다. `FormParts`는 공통 입력 컴포넌트 재수출만 바꿀 수 있으며 검증 규칙은 유지한다.

## 순서와 통합

1. 코드와 시안 확인 → 이 계획 작성 → 홈 해시 보존.
2. 리드 공통 부품/CSS/입력칸/정지 아이폰 구현, 로컬 서비스 이미지 기본값 연결, 환경 파일을 읽지 않는 프론트 검수 config 작성. 빌드 통과.
3. A/B/C 병렬 구현. 각자 자기 화면을 1440×900 / 390×844로 촬영하고 직접 이미지 확인. 공통 수정 요청은 리드에게 전달.
4. 리드는 기존 15개 타입 오류를 최소 수정 검토하고 오프라인 CDP 검수 도구/가짜 API 응답을 준비. 서버는 실행하지 않는다.
5. 결과 통합 후 리드가 공통 요청 반영, 전체 tsc와 프론트 빌드. 전체 10개 경로의 첫 화면 및 데스크톱2~3/모바일1~2 스크롤 사진 직접 검토.
6. 예약 4단계/빈칸 검증/성공 제출과 B2B 검증/성공 제출을 실제 키보드 입력 및 API 가로채기로 확인. 헤더·필터·아코디언·폼 키보드, 넘침, reduced motion, 홈 회귀도 확인.
7. 한국어 완료 보고와 `docs/redesign/verification/subpages-v2/` 스크린샷 갤러리 제공. commit/push/배포 없음.

## 위험 관리

CodeGraph는 이 저장소에서 미초기화 상태다(직접 확인). 앞서 초기화 질문은 전달했으므로 이번 작업은 알려진 파일을 직접 읽어 진행한다. 비밀 파일과 마이그레이션 파일은 읽지 않는다. 타입 수정을 위해 DB 런타임 동작을 바꿔야 하는 경우 해당 수정은 하지 않고 이유를 보고한다.
