# 홈 고객사 로고 원본과 단색 PNG 생성

사용자가 제공한 원본 34개를 보존한다. 이 폴더는 Vite의 public 폴더 밖에 있어 배포 이미지에 포함되지 않는다. `logos.json`에는 이름, 순서, 변환 방식과 원본 SHA-256을 기록했다.

저장소 루트에서 실행:

```sh
node docs/redesign/client-logos-src/bake.mjs
```

로컬 헤드리스 Chrome 실행 권한이 필요하다. 기존 검수용 `browser.mjs`를 사용하며 환경 파일, API 서버, 외부 네트워크를 사용하지 않는다. 추가 의존성도 없다.

- Chrome canvas에 긴 변 1200px로 원본을 그린다.
- 기본 alpha는 `원래 alpha × clamp((255 - min(r,g,b)) / 40, 0, 1)`이다. 컴패션·신용보증기금은 원래 alpha를 사용한다.
- 잉크 범위를 자르고 최종 여백 1px, 최대 높이 156px로 축소한다.
- RGB `#1d1d1f`와 canvas의 256단계 alpha를 손실 없이 팔레트 PNG로 저장한다. CSS filter는 사용하지 않는다.
- 표시 면적 기준은 4800px². 면적에 `clamp((밀도 중앙값 / 해당 로고 밀도)^0.35, 0.75, 1.15)`를 곱해 무거운 로고는 줄이고 가벼운 로고는 키운다. 기존 너비 최대 200px, 높이 24~52px 제한은 유지하고 `object-fit: contain`으로 원래 비율을 보존한다.
- `client/src/content/clientLogos.ts`의 크기와 17개씩 두 줄을 생성한다. 모바일 크기는 0.6배다.
- 두 반복 그룹에 마지막 간격까지 동일하게 포함한다. 간격은 데스크톱 68px / 모바일 32px, 속도는 두 줄 모두 40px/s다. 원본 순서는 각 줄의 그룹 내부에서 유지하고 둘째 줄은 반대 방향으로 움직인다.

출력:

- `client/public/images/clients/*.png`: 사이트용 단색 PNG 34개, 총 447,610바이트.
- `client/src/content/clientLogos.ts`: 한국어 alt, 이미지 경로, 사전 계산한 표시 크기, 줄별 이동 시간.
- `docs/redesign/verification/logos/mono-sheet.png`: 단색 로고와 실제 크기 모아 보기.
- `docs/redesign/verification/logos/bake-report.json`: 크기·비율·밀도·면적 보정 기록.

검수 결과: HSBC, 캐리어, 현대백화점 등의 내부 흰 글자·빈 공간 유지. 서울특별시는 사용자 제공 공식 가로형(심벌 + 서울특별시 글자) 원본 `seoul.png`로 교체했고 knockout 방식으로 변환했다. 나머지 로고도 원본 형상과 워드마크를 유지한다.

로고가 없는 법무법인 넥서스·청년사관학교·스타일난다·서울시민대학·오페라박물관·피스피스는 홈 로고 흐름에서 제외했다. 서비스 페이지의 글자 목록은 수정하지 않았다.
