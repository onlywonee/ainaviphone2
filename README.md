# ainaviphone2

## Naver Maps API 설정

이 앱은 네이버 지도를 표시하고, 목적지 검색과 자동차 경로 생성을 네이버 Cloud Maps API로 호출합니다.

현재 화면에 `NAVER_MAP_CLIENT_ID 환경 변수가 없어 네이버 지도를 불러오지 못했습니다.`가 보이면 **코드 안에 키를 넣는 게 아니라 배포/로컬 실행 환경 변수에 키를 넣어야 한다**는 뜻입니다.

## 바로 넣어야 하는 값

네이버 콘솔이 두 군데라 이름을 헷갈리기 쉽습니다. 아래처럼 넣으면 됩니다.

### 1) 네이버 클라우드 플랫폼 Maps 화면

첫 번째 캡처의 **NAVER Cloud Platform → Maps → Application → 인증 정보** 값입니다.

| 캡처의 라벨 | Vercel 환경변수 이름 | 쓰는 곳 |
| --- | --- | --- |
| `Client ID (X-NCP-APIGW-API-KEY-ID)` | `NAVER_CLOUD_MAPS_NCP_KEY_ID` | 지도 SDK 인증 + Geocoding/Directions REST API 인증 ID |
| `Client Secret (X-NCP-APIGW-API-KEY)` | `NAVER_CLOUD_MAPS_CLIENT_SECRET` | Geocoding/Directions REST API Secret |

즉 첫 번째 캡처에서는 **ID 하나 + Secret 하나**, 총 2개만 넣으면 됩니다. `NAVER_CLOUD_MAPS_CLIENT_ID`를 따로 만들 필요 없습니다.

### 2) 네이버 Developers 화면

두 번째 캡처의 **NAVER Developers → Application** 값입니다.

| 캡처의 라벨 | Vercel 환경변수 이름 | 쓰는 곳 |
| --- | --- | --- |
| `Client ID` | `NAVER_DEVELOPERS_SEARCH_CLIENT_ID` | 지역/장소 검색 API |
| `Client Secret` | `NAVER_DEVELOPERS_SEARCH_CLIENT_SECRET` | 지역/장소 검색 API Secret |

### 기존 이름도 지원합니다

코드는 기존에 안내했던 이름도 계속 읽습니다. 즉 아래 이름들도 alias로 동작합니다.

- `NAVER_MAP_NCP_KEY_ID` 또는 `NAVER_MAP_CLIENT_ID` → `NAVER_CLOUD_MAPS_NCP_KEY_ID`와 같은 의미
- `NAVER_MAP_CLIENT_SECRET` → `NAVER_CLOUD_MAPS_CLIENT_SECRET`과 같은 의미
- `NAVER_SEARCH_CLIENT_ID` → `NAVER_DEVELOPERS_SEARCH_CLIENT_ID`와 같은 의미
- `NAVER_SEARCH_CLIENT_SECRET` → `NAVER_DEVELOPERS_SEARCH_CLIENT_SECRET`과 같은 의미

Secret 값들은 절대 `index.html`에 직접 넣지 말고, Vercel/로컬 `.env` 환경 변수로만 넣습니다.

## Vercel에 넣는 방법

1. Vercel 대시보드에서 이 프로젝트를 엽니다.
2. **Settings → Environment Variables**로 이동합니다.
3. 아래 환경 변수를 각각 추가합니다.

```bash
NAVER_CLOUD_MAPS_NCP_KEY_ID=첫번째_캡처의_Client_ID_X_NCP_APIGW_API_KEY_ID
NAVER_CLOUD_MAPS_CLIENT_SECRET=첫번째_캡처의_Client_Secret_X_NCP_APIGW_API_KEY
NAVER_DEVELOPERS_SEARCH_CLIENT_ID=두번째_캡처의_Naver_Developers_Client_ID
NAVER_DEVELOPERS_SEARCH_CLIENT_SECRET=두번째_캡처의_Naver_Developers_Client_Secret
```

4. Environment 범위는 보통 **Production**, **Preview**, **Development**에 모두 체크합니다.
5. 저장한 뒤 **반드시 Redeploy**합니다. 이미 떠 있는 배포본은 새 환경 변수를 자동으로 다시 읽지 않습니다.


## GitHub 화면에 넣는 건가요?

질문에 나온 **GitHub → Settings → Environments → Add variable** 화면은 GitHub Actions나 GitHub Pages 배포 워크플로가 그 값을 읽을 때만 사용합니다. 이 프로젝트를 **Vercel에 연결해서 배포하는 중이면 이 화면이 아니라 Vercel에 넣어야 합니다.**

- **Vercel 배포를 쓰는 경우:** Vercel 프로젝트의 **Settings → Environment Variables**에 넣습니다. 이 프로젝트의 `/api/naver-maps.js`, `/api/geocode`, `/api/directions`는 Vercel 서버리스 환경의 `process.env`에서 값을 읽습니다.
- **GitHub Actions가 Vercel 배포를 대신 실행하는 경우:** GitHub의 **Secrets and variables → Actions** 또는 해당 workflow가 읽는 Environment에 넣고, workflow에서 Vercel 빌드/배포 환경 변수로 전달해야 합니다. 지금 캡처의 Add variable 화면에만 넣으면 Vercel 런타임에서 자동으로 읽히지 않을 수 있습니다.
- **GitHub Pages만 쓰는 경우:** 이 구조는 `/api/*` 서버리스 함수가 필요하므로 GitHub Pages 단독 배포에는 맞지 않습니다. Vercel 배포를 사용하세요.

캡처 화면에 꼭 넣어야 하는 상황이라면 아래처럼 변수들을 각각 추가합니다.

```bash
Name: NAVER_CLOUD_MAPS_NCP_KEY_ID
Value: 첫번째 캡처의 Client ID (X-NCP-APIGW-API-KEY-ID)

Name: NAVER_CLOUD_MAPS_CLIENT_SECRET
Value: 첫번째 캡처의 Client Secret (X-NCP-APIGW-API-KEY)

Name: NAVER_DEVELOPERS_SEARCH_CLIENT_ID
Value: 두번째 캡처의 Naver Developers Client ID

Name: NAVER_DEVELOPERS_SEARCH_CLIENT_SECRET
Value: 두번째 캡처의 Naver Developers Client Secret
```

하지만 Vercel 배포라면 위 값들을 GitHub가 아니라 **Vercel Environment Variables**에 추가한 뒤 Redeploy 하는 것이 정답입니다.

## 로컬에서 넣는 방법

로컬 테스트는 `.env.example`을 복사해서 `.env`를 만들고 값을 채우면 됩니다.

```bash
cp .env.example .env
```

`.env` 파일 내용 예시:

```bash
NAVER_CLOUD_MAPS_NCP_KEY_ID=여기에_첫번째_캡처의_Client_ID_X_NCP_APIGW_API_KEY_ID
NAVER_CLOUD_MAPS_CLIENT_SECRET=여기에_첫번째_캡처의_Client_Secret_X_NCP_APIGW_API_KEY
NAVER_DEVELOPERS_SEARCH_CLIENT_ID=여기에_두번째_캡처의_Naver_Developers_Client_ID
NAVER_DEVELOPERS_SEARCH_CLIENT_SECRET=여기에_두번째_캡처의_Naver_Developers_Client_Secret
```

`.env`는 `.gitignore`에 들어가 있으므로 커밋하지 않습니다. 로컬에서는 Vercel 서버리스 함수가 필요하므로 일반 정적 서버 대신 `vercel dev` 방식으로 실행해야 `/api/*`가 같이 동작합니다.


## 배포 후 바로 확인하는 방법

Vercel에 환경 변수를 넣고 Redeploy 한 다음, 배포 주소 뒤에 아래 경로를 붙여서 확인할 수 있습니다.

```txt
https://내-vercel-도메인.vercel.app/api/naver-health
```

위 주소는 키 값 자체는 보여주지 않고, Cloud Maps/Developers 키가 들어왔는지만 `true/false`로 보여줍니다. 또한 `envSources`에 실제로 어떤 환경변수 이름을 읽었는지도 표시합니다. 실제 네이버 API 호출까지 확인하려면 아래처럼 `live=1`을 붙입니다.

```txt
https://내-vercel-도메인.vercel.app/api/naver-health?live=1
```

`live=1` 결과에서 `configured.mapNcpKeyId`, `configured.mapClientSecret`, `geocode.ok`, `directions.ok`, `localSearch.ok`가 `true`면 지도/경로/검색 키가 서버에서 정상으로 읽히고 네이버 API 호출도 성공한 것입니다. `envSources.mapClientId`가 `NAVER_CLOUD_MAPS_NCP_KEY_ID` 쪽이고, `envSources.searchClientId`가 `NAVER_DEVELOPERS_SEARCH_CLIENT_ID` 쪽이면 두 콘솔의 키가 올바른 용도로 연결된 것입니다.

`credentialRouting`도 같이 확인할 수 있습니다. 정상 연결이면 다음처럼 나와야 합니다.

```json
{
  "credentialRouting": {
    "mapSdk": { "console": "Naver Cloud Platform Maps", "envSource": "NAVER_CLOUD_MAPS_NCP_KEY_ID" },
    "geocode": { "console": "Naver Cloud Platform Maps", "clientIdEnvSource": "NAVER_CLOUD_MAPS_NCP_KEY_ID" },
    "directions": { "console": "Naver Cloud Platform Maps", "clientIdEnvSource": "NAVER_CLOUD_MAPS_NCP_KEY_ID" },
    "localSearch": { "console": "Naver Developers", "clientIdEnvSource": "NAVER_DEVELOPERS_SEARCH_CLIENT_ID" }
  }
}
```

그래도 브라우저 지도가 안 뜨면 아래의 Web Dynamic Map 도메인 등록 문제일 가능성이 큽니다.



## 프론트 콘솔 에러별 의미

- `SyntaxError: Can't create duplicate variable: 'tagCategoryMeta'`
  - 같은 태그 사전 스크립트가 브라우저에서 두 번 평가될 때 생기는 중복 선언 에러였습니다. 현재는 태그 사전/매처를 factory 방식으로 바꿔 중복 로드되어도 전역 `const`가 다시 선언되지 않게 했습니다.
- `TypeError: null is not an object (evaluating 'new naver.maps.Circle')`
  - 네이버 지도 SDK가 로드됐지만 `naver.maps.Circle` 생성자가 제공되지 않거나 인증 실패 후 일부 객체가 비어 있을 때 생깁니다. 현재는 Circle이 없으면 Marker 기반 원형 표시로 fallback 하도록 했습니다. 그래도 지도가 비어 있으면 `NAVER_CLOUD_MAPS_NCP_KEY_ID`와 Web Dynamic Map 도메인 등록을 먼저 확인하세요.

## `validatev3` / `v3/auth` 인증 에러가 보일 때

브라우저 콘솔에 `oapi.map.naver.com/v1/validatev3` 또는 `oapi.map.naver.com/v3/auth`가 보이면서 지도가 안 뜨면 대부분 아래 둘 중 하나입니다.

1. **잘못된 지도 SDK 키**
   - 네이버 지도 JavaScript SDK는 `ncpKeyId` 파라미터로 인증합니다.
   - Vercel에 `NAVER_CLOUD_MAPS_NCP_KEY_ID` 또는 `NAVER_MAP_NCP_KEY_ID`를 추가하고, 값은 Naver Cloud Platform Maps Application의 Web Dynamic Map `ncpKeyId`를 넣으세요.
   - 현재 설정은 `NAVER_CLOUD_MAPS_NCP_KEY_ID` 하나를 지도 SDK와 REST API Client ID로 같이 사용합니다.

2. **Web Dynamic Map 서비스 URL/도메인 미등록**
   - Naver Cloud Platform → Maps → Application에서 **Web Dynamic Map**이 활성화되어 있어야 합니다.
   - 해당 Application의 Web 서비스 URL에 실제 접속 도메인을 등록해야 합니다. 예: `your-app.vercel.app` 또는 커스텀 도메인.
   - Preview 배포 주소로 테스트한다면 `xxx-git-branch-user.vercel.app` 같은 Preview 도메인도 따로 등록해야 합니다.
   - URL에 경로나 페이지 주소(`/api/...`, `/index.html`)를 넣지 말고 도메인 기준으로 등록하세요.

환경 변수를 수정하거나 네이버 콘솔 도메인을 수정한 뒤에는 Vercel에서 **Redeploy**하고 브라우저 캐시를 새로고침하세요.

## 네이버 콘솔에서 켤 서비스

Naver Cloud Platform 콘솔의 Maps Application에서 아래 서비스를 활성화해 주세요.

- **Web Dynamic Map**: 지도 화면 로드용
- **Geocoding**: 검색 결과 주소를 지도 좌표로 변환
- **Directions 5**: 자동차 경로 계산용

Naver Developers 애플리케이션에서는 아래 API 사용 권한을 켜 주세요.

- **검색 > 지역(Local) 검색**: 목적지/장소 이름 검색용

브라우저 도메인 제한에는 로컬/배포 도메인을 등록해야 합니다. 예를 들어 Vercel 배포 도메인과 로컬 테스트 주소를 함께 추가합니다.

## API 연결 구조

```txt
index.html
  ├─ /api/naver-maps.js  → NAVER_CLOUD_MAPS_NCP_KEY_ID로 네이버 지도 JavaScript SDK 로드
  ├─ /api/geocode        → NAVER_DEVELOPERS_SEARCH_*로 지역 검색 후 NAVER_CLOUD_MAPS_*로 Geocoding 호출
  └─ /api/directions     → NAVER_CLOUD_MAPS_NCP_KEY_ID + NAVER_CLOUD_MAPS_CLIENT_SECRET으로 Naver Directions 5 API 호출
```

`NAVER_CLOUD_MAPS_CLIENT_SECRET`과 `NAVER_DEVELOPERS_SEARCH_CLIENT_SECRET`은 위 서버리스 API 안에서만 사용하고, 브라우저 HTML/JS에는 직접 노출하지 않습니다.
