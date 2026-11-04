# 페이지 구현 팀 공통 규칙

세 팀(A·B·C)이 같은 작업 폴더에서 **동시에** 일한다. 아래 규칙을 지켜야 서로 덮어쓰지 않는다.

## 먼저 읽을 것
- `docs/redesign/PLAN.md` — 기획(2장 페이지 구성, 3장 디자인 시스템)
- `docs/redesign/FOUNDATION.md` — 이미 만들어진 공통 기반 사용법
- `client/src/components/site/motion.tsx`(Reveal, Stagger, ParallaxImage, ScaleOnScroll, CountUp), `Logo.tsx`, `SiteLayout.tsx`, `client/src/styles/tokens.css`
- 콘텐츠: `client/src/content/copy.ts`(카피), `brand.ts`(숫자·연혁·수상·언론·클라이언트·프로젝트 103건·유지관리), `images.ts` + `client/src/hooks/useSiteImage.ts`(사진은 반드시 `useSiteImage(key)`로 가져온다. 관리자에서 교체 가능해야 함)

## 품질 기준
- "애플이 만든 것 같은" 쿠퍼티노 디자인. apple.com 제품 페이지의 리듬을 따른다: 큰 타이포, 한 화면 한 메시지, 넉넉한 여백, 섹션 배경 교차(#FFF / #F5F5F7 / 다크), 둥근 타일(18/28), 알약형 버튼, `더 알아보기 ›` 텍스트 링크
- 스크롤 연출을 적극적으로 쓴다(sticky 고정 + 스크롤 진행에 따른 transform/opacity, 스태거 등장, 패럴랙스, 스케일). 모션은 transform/opacity만 쓰고, `prefers-reduced-motion`에서는 정적으로 보여야 한다
- 반응형: 390 / 734 / 1068 / 1440 폭에서 모두 깔끔해야 한다. 가로 스크롤이 생기면 안 된다(의도한 캐러셀은 예외)
- 접근성: 의미 있는 heading 순서, 이미지 alt, 포커스 링, 버튼·링크 구분, 대비 4.5:1
- 카피는 `copy.ts`를 쓴다. 필요한 문구가 없으면 페이지 파일 안에 상수로 추가한다(`copy.ts` 수정 금지). 사실·숫자는 `brand.ts`에 있는 것만

## 파일 소유권 (가장 중요)
- 각 팀은 **자기 페이지 파일**과 **자기 폴더**(`client/src/pages/site/<팀 폴더>/`)만 만들고 고친다
- 수정 금지(공용): `client/src/components/site/*`, `client/src/styles/*`, `tailwind.config.ts`, `client/index.html`, `client/src/App.tsx`, `client/src/content/*`, `client/src/hooks/*`, `client/src/assets/*`, `server/*`, `shared/*`, `script/*`, `package.json`
- 공용 파일 수정이 꼭 필요하면 고치지 말고 보고서의 "공용 변경 요청"에 적는다. 필요한 부품은 자기 팀 폴더 안에 만든다
- `.env*` 접근, git commit/push, 패키지 설치, DB 명령 금지

## 검수 (팀끼리 충돌하지 않게)
- 타입: `npx tsc --noEmit` — 자기 파일에서 새 오류 0개(기존 15개는 무시)
- 빌드: `npx vite build --outDir /tmp/<팀>-dist --emptyOutDir` (공용 dist 폴더 사용 금지)
- 화면: `npx vite preview --outDir /tmp/<팀>-dist --port <팀 포트> --strictPort`로 띄우고 헤드리스 크롬으로 1440·390 스크린샷을 찍어 **직접 보고 다듬는다**. 스크롤 연출은 스크롤 위치별로 2–3장 찍는다. DB가 없으므로 `/api/*`는 브라우저 요청 가로채기(mock)로 `brand.ts`나 그럴듯한 샘플 데이터를 돌려준다
- 결과 이미지는 `docs/redesign/verification/<팀>/`에 저장한다
- 보고(30줄 이내): 만든·고친 파일, 주요 연출, 검수 결과, 남은 문제, 공용 변경 요청
