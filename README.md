# ainaviphone2

## Naver Maps API 설정

이 앱은 네이버 지도를 표시하고, 목적지 검색과 자동차 경로 생성을 네이버 Cloud Maps API로 호출합니다.

현재 화면에 `NAVER_MAP_CLIENT_ID 환경 변수가 없어 네이버 지도를 불러오지 못했습니다.`가 보이면 **코드 안에 키를 넣는 게 아니라 배포/로컬 실행 환경 변수에 키를 넣어야 한다**는 뜻입니다.

## 바로 넣어야 하는 값 4개

네이버 키가 **지도/경로용**과 **검색용**으로 따로 있으면 아래처럼 4개를 넣으면 됩니다.

| 넣을 이름 | 네이버에서 가져올 값 | 어디에 쓰이나요? | 필수 여부 |
| --- | --- | --- | --- |
| `NAVER_MAP_CLIENT_ID` | Naver Cloud Platform Maps Application의 **Client ID / ncpKeyId** | 네이버 지도 화면, Geocoding, Directions 5 | 필수 |
| `NAVER_MAP_CLIENT_SECRET` | Naver Cloud Platform Maps Application의 **Client Secret** | Geocoding, Directions 5 서버 호출 | 필수 |
| `NAVER_SEARCH_CLIENT_ID` | Naver Developers Search API 애플리케이션의 **Client ID** | 목적지/장소 검색 품질 보강 | 있으면 사용 |
| `NAVER_SEARCH_CLIENT_SECRET` | Naver Developers Search API 애플리케이션의 **Client Secret** | 목적지/장소 검색 서버 호출 | 있으면 사용 |

정리하면:

- **지도 관련 키**는 `NAVER_MAP_CLIENT_ID`, `NAVER_MAP_CLIENT_SECRET`에 넣습니다.
- **검색 관련 키**는 `NAVER_SEARCH_CLIENT_ID`, `NAVER_SEARCH_CLIENT_SECRET`에 넣습니다.
- `NAVER_SEARCH_*`가 없으면 검색 API 없이 지도 Geocoding만으로 목적지를 찾도록 fallback 됩니다.
- Secret 값들은 절대 `index.html`에 직접 넣지 말고, Vercel/로컬 `.env` 환경 변수로만 넣습니다.

## Vercel에 넣는 방법

1. Vercel 대시보드에서 이 프로젝트를 엽니다.
2. **Settings → Environment Variables**로 이동합니다.
3. 아래 환경 변수를 각각 추가합니다.

```bash
NAVER_MAP_CLIENT_ID=네이버_지도_Client_ID_또는_ncpKeyId
NAVER_MAP_CLIENT_SECRET=네이버_지도_Client_Secret
NAVER_SEARCH_CLIENT_ID=네이버_개발자_검색_Client_ID
NAVER_SEARCH_CLIENT_SECRET=네이버_개발자_검색_Client_Secret
```

4. Environment 범위는 보통 **Production**, **Preview**, **Development**에 모두 체크합니다.
5. 저장한 뒤 **반드시 Redeploy**합니다. 이미 떠 있는 배포본은 새 환경 변수를 자동으로 다시 읽지 않습니다.


## GitHub 화면에 넣는 건가요?

질문에 나온 **GitHub → Settings → Environments → Add variable** 화면은 GitHub Actions나 GitHub Pages 배포 워크플로가 그 값을 읽을 때만 사용합니다. 이 프로젝트를 **Vercel에 연결해서 배포하는 중이면 이 화면이 아니라 Vercel에 넣어야 합니다.**

- **Vercel 배포를 쓰는 경우:** Vercel 프로젝트의 **Settings → Environment Variables**에 넣습니다. 이 프로젝트의 `/api/naver-maps.js`, `/api/geocode`, `/api/directions`는 Vercel 서버리스 환경의 `process.env`에서 값을 읽습니다.
- **GitHub Actions가 Vercel 배포를 대신 실행하는 경우:** GitHub의 **Secrets and variables → Actions** 또는 해당 workflow가 읽는 Environment에 넣고, workflow에서 Vercel 빌드/배포 환경 변수로 전달해야 합니다. 지금 캡처의 Add variable 화면에만 넣으면 Vercel 런타임에서 자동으로 읽히지 않을 수 있습니다.
- **GitHub Pages만 쓰는 경우:** 이 구조는 `/api/*` 서버리스 함수가 필요하므로 GitHub Pages 단독 배포에는 맞지 않습니다. Vercel 배포를 사용하세요.

캡처 화면에 꼭 넣어야 하는 상황이라면 아래처럼 **네 개 변수**를 각각 추가합니다.

```bash
Name: NAVER_MAP_CLIENT_ID
Value: 네이버 Cloud Maps의 Client ID 또는 ncpKeyId

Name: NAVER_MAP_CLIENT_SECRET
Value: 네이버 Cloud Maps의 Client Secret

Name: NAVER_SEARCH_CLIENT_ID
Value: 네이버 Developers 검색 API의 Client ID

Name: NAVER_SEARCH_CLIENT_SECRET
Value: 네이버 Developers 검색 API의 Client Secret
```

하지만 Vercel 배포라면 위 값들을 GitHub가 아니라 **Vercel Environment Variables**에 추가한 뒤 Redeploy 하는 것이 정답입니다.

## 로컬에서 넣는 방법

로컬 테스트는 `.env.example`을 복사해서 `.env`를 만들고 값을 채우면 됩니다.

```bash
cp .env.example .env
```

`.env` 파일 내용 예시:

```bash
NAVER_MAP_CLIENT_ID=여기에_네이버_지도_Client_ID_또는_ncpKeyId
NAVER_MAP_CLIENT_SECRET=여기에_네이버_지도_Client_Secret
NAVER_SEARCH_CLIENT_ID=여기에_네이버_개발자_검색_Client_ID
NAVER_SEARCH_CLIENT_SECRET=여기에_네이버_개발자_검색_Client_Secret
```

`.env`는 `.gitignore`에 들어가 있으므로 커밋하지 않습니다. 로컬에서는 Vercel 서버리스 함수가 필요하므로 일반 정적 서버 대신 `vercel dev` 방식으로 실행해야 `/api/*`가 같이 동작합니다.


## 배포 후 바로 확인하는 방법

Vercel에 환경 변수를 넣고 Redeploy 한 다음, 배포 주소 뒤에 아래 경로를 붙여서 확인할 수 있습니다.

```txt
https://내-vercel-도메인.vercel.app/api/naver-health
```

위 주소는 키 값 자체는 보여주지 않고, `NAVER_MAP_CLIENT_ID`, `NAVER_MAP_CLIENT_SECRET`, `NAVER_SEARCH_CLIENT_ID`, `NAVER_SEARCH_CLIENT_SECRET`이 들어왔는지만 `true/false`로 보여줍니다. 실제 네이버 API 호출까지 확인하려면 아래처럼 `live=1`을 붙입니다.

```txt
https://내-vercel-도메인.vercel.app/api/naver-health?live=1
```

`live=1` 결과에서 `geocode.ok`, `directions.ok`, `localSearch.ok`가 `true`면 지도/경로/검색 키가 서버에서 정상으로 읽히고 네이버 API 호출도 성공한 것입니다.

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
  ├─ /api/naver-maps.js  → NAVER_MAP_CLIENT_ID로 네이버 지도 JavaScript SDK 로드
  ├─ /api/geocode        → NAVER_SEARCH_*로 지역 검색 후 NAVER_MAP_*로 Geocoding 호출
  └─ /api/directions     → NAVER_MAP_CLIENT_ID + NAVER_MAP_CLIENT_SECRET으로 Naver Directions 5 API 호출
```

`NAVER_MAP_CLIENT_SECRET`과 `NAVER_SEARCH_CLIENT_SECRET`은 위 서버리스 API 안에서만 사용하고, 브라우저 HTML/JS에는 직접 노출하지 않습니다.
