# ainaviphone2

## Naver Maps API 설정

이 앱은 네이버 지도를 표시하고, 목적지 검색과 자동차 경로 생성을 네이버 Cloud Maps API로 호출합니다.

### 1. 네이버 콘솔에서 켤 서비스

Naver Cloud Platform 콘솔의 Maps Application에서 아래 서비스를 활성화해 주세요.

- **Web Dynamic Map**: 지도 화면 로드용
- **Geocoding**: 목적지 주소/장소 검색용
- **Directions 5**: 자동차 경로 계산용

브라우저 도메인 제한에는 로컬/배포 도메인을 등록해야 합니다. 예를 들어 Vercel 배포 도메인과 로컬 테스트 주소를 함께 추가합니다.

### 2. 환경 변수

Vercel 프로젝트 환경 변수 또는 로컬 `.env`에 아래 값을 설정합니다.

```bash
NAVER_MAP_CLIENT_ID=네이버_클라이언트_ID
NAVER_MAP_CLIENT_SECRET=네이버_클라이언트_SECRET
```

- `NAVER_MAP_CLIENT_ID`는 `/api/naver-maps.js`가 네이버 지도 JavaScript SDK를 로드할 때 사용합니다.
- `NAVER_MAP_CLIENT_SECRET`은 `/api/geocode`, `/api/directions` 서버리스 함수에서만 사용합니다.
- Client Secret은 절대 `index.html`에 직접 넣지 마세요.

### 3. API 연결 구조

```txt
index.html
  ├─ /api/naver-maps.js  → 네이버 지도 JavaScript SDK 로드
  ├─ /api/geocode        → Naver Geocoding API
  └─ /api/directions     → Naver Directions 5 API
```
