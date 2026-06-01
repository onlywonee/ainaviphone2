# ainaviphone2

## Naver Maps API 설정

이 앱은 네이버 지도를 표시하고, 목적지 검색과 자동차 경로 생성을 네이버 Cloud Maps API로 호출합니다.

현재 화면에 `NAVER_MAP_CLIENT_ID 환경 변수가 없어 네이버 지도를 불러오지 못했습니다.`가 보이면 **코드 안에 키를 넣는 게 아니라 배포/로컬 실행 환경 변수에 키를 넣어야 한다**는 뜻입니다.

## 바로 넣어야 하는 값 2개

| 넣을 이름 | 네이버 콘솔에서 가져올 값 | 어디에 쓰이나요? | 공개 여부 |
| --- | --- | --- | --- |
| `NAVER_MAP_CLIENT_ID` | Maps Application의 **Client ID / ncpKeyId** | 네이버 지도 화면 로드 + REST API 인증 ID | 브라우저 지도 로드에 필요하지만 도메인 제한 필수 |
| `NAVER_MAP_CLIENT_SECRET` | Maps Application의 **Client Secret** | `/api/geocode`, `/api/directions` 서버리스 함수에서 네이버 검색/경로 호출 | 절대 `index.html`에 직접 넣지 않기 |

> 네이버 콘솔 화면에서 `Client ID`, `ncpKeyId`, `인증 정보 ID`처럼 보이는 값은 `NAVER_MAP_CLIENT_ID`에 넣고, `Client Secret` 또는 `인증 정보 Secret`은 `NAVER_MAP_CLIENT_SECRET`에 넣으면 됩니다.

## Vercel에 넣는 방법

1. Vercel 대시보드에서 이 프로젝트를 엽니다.
2. **Settings → Environment Variables**로 이동합니다.
3. 아래 환경 변수를 각각 추가합니다.

```bash
NAVER_MAP_CLIENT_ID=네이버_클라이언트_ID
NAVER_MAP_CLIENT_SECRET=네이버_클라이언트_SECRET
```

4. Environment 범위는 보통 **Production**, **Preview**, **Development**에 모두 체크합니다.
5. 저장한 뒤 **반드시 Redeploy**합니다. 이미 떠 있는 배포본은 새 환경 변수를 자동으로 다시 읽지 않습니다.

## 로컬에서 넣는 방법

로컬 테스트는 `.env.example`을 복사해서 `.env`를 만들고 값을 채우면 됩니다.

```bash
cp .env.example .env
```

`.env` 파일 내용 예시:

```bash
NAVER_MAP_CLIENT_ID=여기에_네이버_Client_ID
NAVER_MAP_CLIENT_SECRET=여기에_네이버_Client_Secret
```

`.env`는 `.gitignore`에 들어가 있으므로 커밋하지 않습니다. 로컬에서는 Vercel 서버리스 함수가 필요하므로 일반 정적 서버 대신 `vercel dev` 방식으로 실행해야 `/api/*`가 같이 동작합니다.

## 네이버 콘솔에서 켤 서비스

Naver Cloud Platform 콘솔의 Maps Application에서 아래 서비스를 활성화해 주세요.

- **Web Dynamic Map**: 지도 화면 로드용
- **Geocoding**: 목적지 주소/장소 검색용
- **Directions 5**: 자동차 경로 계산용

브라우저 도메인 제한에는 로컬/배포 도메인을 등록해야 합니다. 예를 들어 Vercel 배포 도메인과 로컬 테스트 주소를 함께 추가합니다.

## API 연결 구조

```txt
index.html
  ├─ /api/naver-maps.js  → NAVER_MAP_CLIENT_ID로 네이버 지도 JavaScript SDK 로드
  ├─ /api/geocode        → NAVER_MAP_CLIENT_ID + NAVER_MAP_CLIENT_SECRET으로 Naver Geocoding API 호출
  └─ /api/directions     → NAVER_MAP_CLIENT_ID + NAVER_MAP_CLIENT_SECRET으로 Naver Directions 5 API 호출
```

`NAVER_MAP_CLIENT_SECRET`은 위 서버리스 API 안에서만 사용하고, 브라우저 HTML/JS에는 직접 노출하지 않습니다.
