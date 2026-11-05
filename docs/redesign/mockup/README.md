# 승인된 홈 시안 (2026-11-05)

- `home.dc.html`: 클로드디자인 캔버스 시안 원본(https://claude.ai/artifact/Gh3RRMAc7pfMGi4wFHjxT3, 8번째 버전). 사용자가 "헤더 1줄로 해서 구현"으로 승인했다.
  - 스타일: `<helmet><style>` 안. 화면: `</helmet>` 다음부터 `</x-dc>` 앞까지.
  - 맨 끝 `<script type="text/x-dc">`, `support.js` 는 캔버스 전용이라 무시한다.
  - `@media (min-height:2400px)` 블록은 캔버스 보드(높이 8000px 상한) 전용이다. 실제 사이트로 옮기지 않는다.
- 같은 화면을 일반 HTML로 만든 확인용 사본: `docs/redesign/verification/motion/index.html`(git 제외, 사진 내장).
- 측정 근거: `docs/redesign/APPLE-ANALYSIS.md`.

## 사진 대응표 (`/_blob/<id>` → `client/public/images/home/`)

| blob id | 파일 | 쓰는 곳 |
|---|---|---|
| ba8f5e12b4d11816fb1bcca97623c46e | hero.jpg | 첫 화면 사진 카드 |
| d3b7252b0ea2ea5667b2e021fd8fecb4 | plant-studio.jpg | 하이라이트 '식물관리', 매거진 카드 |
| f1b05a87764982aec29eaf6cc14b80eb | education.jpg | 하이라이트 '교육' |
| 3373f055fe9dbf1914637707d71befa9 | landscape.jpg | 하이라이트 '조경' |
| 3db934b986fafc8628570cb23c24e88d | sales.jpg | 하이라이트 '판매' |
| 22ea7f2a1dec6d0dfef822a49c1a58ee | platform.jpg | 하이라이트 'simda 플랫폼', 플랫폼 옆 사진 카드 |
| b97a0c8e5f28be5ce63a8e252ff13a0c | work1.jpg | 브랜드 스토리 몰입 사진, 작업 타일 '오페라박물관' |
| 7e9951586c51ea6e1000556cce2af30d | work2.jpg | 작업 타일 '캘러웨이 코리아' |
| b333d8ad087d2514526df4206f72a377 | work3.jpg | 작업 타일 '헤이즈밀 베이커리' |
| 785fda74bdeb2de95514a9d28445e0a2 | plant-pot.jpg | 플랫폼 앱 화면·옆 카드, 매거진 카드 |

`care.jpg` 는 예비 사진이다. 모든 사진은 Unsplash 임시 사진이고 관리자 '사이트 이미지'에서 바꿀 수 있게 한다.
