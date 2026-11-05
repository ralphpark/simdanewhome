# 하위 페이지 디자인 적용 — 2단계 완료 보고

2026-11-05. [사전 계획](phase2-plan.md)에 따라 리드가 공통 부품을 먼저 구현·빌드한 뒤 A(브랜드·서비스), B(포트폴리오·매거진), C(고객센터·폼)를 병렬 실행했다. 각 담당자의 검수 후 리드가 통합 빌드·전체 화면·폼·회귀 검수를 다시 수행했다.

## 결과

- `npm run check` 통과. 1단계에서 남았던 기존 타입 오류 15개도 해결했다.
- 환경 파일을 읽지 않는 프론트 전용 Vite 빌드 통과.
- 10개 경로를 1440×900, 390×844에서 첫 화면과 스크롤 위치별로 총 70장 촬영하고 직접 열어 검토했다.
- 예약·B2B 폼 14장, 키보드·반응형·모션·홈 회귀 12장을 추가했다. 통합 최종 원본 스크린샷은 96장이다(에이전트 별도 검수와 비교 모음 제외).
- 통합 화면 70회 및 경계/동작 줄이기 44회 레이아웃 체크에서 가로 넘침·화면 내 깨진 이미지·sticky 헤더 이상 없음. 런타임 예외 0.
- 홈 소스·토큰·헤더·푸터 해시 불변. 홈 주요 14개 요소의 위치·크기·색·글자 크기는 1단계 기록과 두 화면 크기 모두 정확히 일치했다.

## 페이지별 구성

| 경로 | 구성 |
| --- | --- |
| `/story` | 확장 사진 PageHead → 철학 두 문단·사진 → DB 연혁/빈 데이터 milestones 대체·sticky 연도 → 숫자/특허/인증/수상 벤토 → 언론 목록 → WaysCards |
| `/services` | PageHead → 플랫폼·식물관리·교육·조경·판매 5구간, 큰 사진·사례·버튼 → 함께한 곳 → AI 큐레이션 링크. 플랫폼에 홈 도착 화면의 정지 아이폰과 특허 배지 사용 |
| `/portfolio` | PageHead → 기존 분류 SegmentedControl → 2열/모바일1열 사진 타일 → 연도별 텍스트 아카이브 |
| `/portfolio/:id` | 큰 커버 → 왼쪽 제목·소개/오른쪽 메타 → 순서대로 큰 사진 → 다음 프로젝트 타일 |
| `/magazine` | 가운데 제목 → 대표 글 큰 카드 → 카테고리 → 홈과 같은 3열/모바일1열 카드 |
| `/magazine/:id` | 헤더 아래 2px 읽기 진행 막대 → 제목·소개·메타·커버 → 폭680/본문17·1.7 → 기존 댓글 → 관련 글 3장 |
| `/support` | 짧은 PageHead → B2B/예약 카드 두 장 → 얇은 구분선 FAQ → 연락처·운영시간 |
| `/support/b2b` | 확장 사진 PageHead → 협업 분야 4장 → 공통 입력폼·검증·제출·완료 |
| `/support/booking` | 짧은 제목 → 상담 유형 → 날짜·시간 → 연락처·메시지 → 확인 → 완료. 상담 바는 제외 |
| 404·Placeholder | 공통 PageHead·알약 버튼·WaysCards로 같은 톤 적용 |

## 홈에서 이어 만든 공통 부품

`PageHead`, `PhotoReveal`, `SegmentedControl`, `Tiles`/`PhotoTile`, `WaysCards`, `PassBar`, `PageSection`, `ScrollReveal`, `Subpage`, `FloatingInput`, `FloatingTextarea`, `SuccessCheck`, `PlatformPhone`을 한곳에 만들었다. props는 [계획 문서](phase2-plan.md)에 정리했다.

- 기존 토큰을 그대로 사용한다. 스타일은 `.subpage` 및 정지 아이폰의 `.sp-phone-demo`로 한정했다.
- 흰색/`--alt`, 홈 글자 크기, 128px/모바일80px 구간 여백, 그린 알약, 28px 카드, 사진 간격12를 공유한다.
- 사진·글자·상담 바는 CSS scroll timeline, 선택/폼/FAQ 상태 전환만 상태 기반 모션을 사용한다.
- 지원하지 않는 브라우저는 정지 상태의 정상 문서 흐름을 보여 준다. 동작 줄이기에서는 애니메이션과 긴 sticky 트랙을 제거한다.
- PageHead 트랙은 데스크톱1600px, 모바일1400px다. 사진 없는 고객센터·예약 등의 첫 화면은 짧게 구성했다.
- 홈을 공통 컴포넌트로 다시 연결하지 않았다. 승인된 홈의 렌더링을 그대로 보존하기 위해 하위 페이지용 부품을 분리했다.

## 바꾼 파일

아래 목록은 **이번 2단계 변경**이다. 작업 전부터 존재했던 1단계 변경은 포함하지 않는다.

| 파일 | 설명 |
| --- | --- |
| `client/src/components/site/PagePrimitives.tsx` | 페이지 제목·사진·필터·타일·문의 카드·상담 바와 기본 구간 공통화 |
| `client/src/components/site/page-primitives.css` | 하위 페이지 전용 규격·CSS 스크롤 모션·반응형·입력칸 스타일 |
| `client/src/components/site/AppleFields.tsx` | forwarded ref, 라벨·오류 연결을 유지하는 공통 입력칸과 완료 체크 |
| `client/src/components/site/PlatformPhone.tsx` | 홈 아이폰 도착 화면을 정지 상태로 재사용 |
| `client/src/components/site/platform-phone.css` | 아이폰 시안 스타일을 별도 범위에 복제하고 장식 애니메이션 제거 |
| `client/src/content/images.ts` | 서비스 5개와 하위 페이지 기본 사진을 승인 시안의 로컬 사진으로 연결 |
| `client/src/pages/site/Story.tsx` | 공통 Subpage 적용 |
| `client/src/pages/site/story/sections.tsx` | 철학·DB 연혁·숫자/인증·언론·마무리 구성 |
| `client/src/pages/site/story/story.css` | sticky 연도·벤토·모바일 한 열 |
| `client/src/pages/site/Services.tsx` | 서비스 5개와 사례·정지 아이폰·AI 링크 구성 |
| `client/src/pages/site/services/services.css` | 서비스 사진·본문·사례의 공통 간격과 반응형 |
| `client/src/pages/site/Portfolio.tsx` | PageHead·필터·사진 타일·연도별 아카이브 |
| `client/src/pages/site/PortfolioDetail.tsx` | 커버·소개/메타·큰 사진·다음 프로젝트 |
| `client/src/pages/site/portfolio/portfolio.css` | 목록과 상세의 사진·표·메타 스타일 |
| `client/src/pages/site/portfolio/shared.css` | 기존 로딩/오류 상태 부품을 `.subpage` 안에서 새 톤에 맞춤 |
| `client/src/pages/site/Magazine.tsx` | 대표 글·필터·홈 형태 카드 목록 |
| `client/src/pages/site/MagazineDetail.tsx` | CSS 읽기 진행·본문 사진 모션·공통 구간 적용 |
| `client/src/pages/site/magazine/PostCard.tsx` | 홈 카드와 같은 표시 정보·구조 |
| `client/src/pages/site/magazine/magazine.css` | 카드·680px 본문·댓글 외형·읽기 진행 스타일 |
| `client/src/pages/site/Support.tsx` | 문의 카드·키보드 FAQ·연락처 사양 구간 |
| `client/src/pages/site/B2B.tsx` | 확장 사진·협업 분야·공통 폼 외형 |
| `client/src/pages/site/Booking.tsx` | 기존 4단계를 가운데 카드와 공통 버튼·입력칸으로 구성 |
| `client/src/pages/site/PlaceholderPage.tsx` | Placeholder와 404를 공통 부품으로 구성 |
| `client/src/pages/not-found.tsx` | 동일한 SiteNotFound 재사용 |
| `client/src/pages/site/support/FormParts.tsx` | 입력·완료 UI만 공통 컴포넌트 재수출; zod 규칙은 원본 유지 |
| `client/src/pages/site/support/team-c.css` | 고객센터·B2B·예약·FAQ·달력의 새 시각 규격 |
| `client/src/pages/B2B.tsx` | 레거시 nullable 입력값을 빈 문자열로 표시해 Input 타입 맞춤 |
| `client/src/pages/Magazine.tsx` | 레거시 Set 순회를 Array.from으로 바꿔 기존 TS target 호환 |
| `client/src/pages/Portfolio.tsx` | 사용하지 않는 잘못된 import 제거, Set 순회 target 호환 |
| `client/src/pages/PlantCareConsultation.tsx` | 메시지 배열에 기존 Message[] 타입 명시 |
| `server/storage.ts` | 메모리 저장소에서 실제 생략될 수 있는 필드의 타입만 분리. DB 구현·기본 IStorage 계약 유지 |
| `client/src/pages/site/verification/vite.config.mts` | 빈 envDir를 사용하는 프론트 전용 빌드 |
| `client/src/pages/site/verification/common-preview.html` | 공통 부품을 별도로 빌드·촬영하는 진입점 |
| `client/src/pages/site/verification/common-preview.tsx` | 실제 공통 부품과 입력칸의 검수 화면 |
| `client/src/pages/site/verification/browser.mjs` | 로컬 서버·가짜 API·외부 차단·일회용 헤드리스 Chrome/CDP 도구 |
| `client/src/pages/site/verification/screenshots.mjs` | 10개 경로의 화면 촬영·넘침/이미지/sticky 검수 |
| `client/src/pages/site/verification/forms.mjs` | 예약·B2B 검증·Tab 순서·기존 요청 필드·성공 확인 |
| `client/src/pages/site/verification/regression.mjs` | 헤더·필터·반응형·모션·기존 홈과의 회귀 비교 |
| `docs/redesign/phase2-plan.md` | 사전 공통 규격·소유권·병렬 작업·통합 계획 |
| `docs/redesign/PHASE2-IMPLEMENTATION.md` | 이 완료 보고서 |

## 검수 근거

| 항목 | 결과 및 근거 |
| --- | --- |
| 전체 타입 검사 | 통과 — `verification/subpages-v2/typecheck.log` |
| 프론트 빌드 | 통과 — `verification/subpages-v2/build.log` |
| 공통 부품 선행 빌드 | 통과 — `verification/subpages-v2/common-build.log` |
| 10개 경로 화면 | 데스크톱4장/모바일3장씩, 총70장 — `screenshots/report.json` |
| 예약 폼 | 1/2/3단계 빈값 메시지, 4단계 완료, Tab 입력 순서, `POST /api/bookings` 7필드, 성공 응답 — `forms/forms-report.json` |
| B2B 폼 | 필수5개 검증, Tab 입력 순서, `POST /api/b2b-proposals` 6필드, 성공 응답 — 같은 보고서 |
| 키보드 | 헤더 Tab/Enter, 모바일 메뉴 포커스 가두기/ESC/복귀, 필터 방향키/Home/End, FAQ Enter/방향키/Home/End/Tab |
| 모션/반응형 | 734/735/1068px, CSS 사진 확장·읽기 진행, reduced motion, scroll timeline 미지원 정지 화면 — `regression/report.json` |
| 홈 불변 | 7개 파일 해시 불변; 14개 요소 × 2개 화면 크기의 기하/글자/색 동일 — `home-before.sha256`, `regression/report.json` |
| 연혁/콘텐츠 | DB 연혁 및 빈 데이터 대체, 공개 글 필터, 상세 링크, 관련3장, 댓글 검증/기존 POST — 에이전트 `focused-report.json`, `interactions-report.json` |
| 서버 타입 수정 | esbuild로 타입 제거 후 수정 전후 JavaScript가 바이트 단위 동일 — `storage-type-only.txt` |

사진은 관리자 이미지 훅을 유지한다. API·DB 스키마·관리자·라우트·댓글 로직·HTML 정화·폼 검증 및 제출 코드는 변경하지 않았다. 실제 API 서버는 실행하지 않았으며 브라우저 검수에서는 요청을 전부 가짜 응답으로 가로챘다.

## 적용 판단과 남은 문제

- 하위 페이지 전용 시안이 없으므로 페이지 구조는 지시서에 따라 만들고, 시각 규격과 부품 형태는 홈에서 가져왔다.
- 포트폴리오에는 장소 필드가 없어서 기존 **연도·클라이언트·분류**를 표시했다. 장소를 추정하거나 API/스키마를 추가하지 않았다.
- 공통 사진 기본값을 로컬 승인 이미지로 교체했다. 관리자 저장값이 있으면 기존처럼 우선 적용된다.
- 검수 범위 내 남은 오류는 없다. 서버 실연결 검증은 요청대로 수행하지 않았다.

## 스크린샷 위치와 재실행

[전체 갤러리](verification/subpages-v2/index.html) · [최종 10개 페이지](verification/subpages-v2/screenshots/index.html) · [폼](verification/subpages-v2/forms/index.html) · [회귀 검수](verification/subpages-v2/regression/index.html)

저장 경로: `docs/redesign/verification/subpages-v2/`. 이 폴더가 git 제외되는 것을 확인했다.

```sh
npm run check
./node_modules/.bin/vite build --config client/src/pages/site/verification/vite.config.mts
node client/src/pages/site/verification/screenshots.mjs --group all --out docs/redesign/verification/subpages-v2/screenshots
node client/src/pages/site/verification/forms.mjs
node client/src/pages/site/verification/regression.mjs
```

헤드리스 Chrome 검수 명령은 localhost/Chrome 실행이 허용되는 권한에서 실행한다. 의존성 설치·commit·push·배포는 하지 않았다.
