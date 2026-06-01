const {
  fetchNaverMapJson,
  fetchNaverSearchJson,
  getNaverMapCredentials,
  getNaverMapSdkKeyId,
  getNaverMapSdkKeySource,
  getNaverSearchCredentials,
  hasCredentials,
  sendJson,
} = require("./_naver");

function redactError(error) {
  return {
    ok: false,
    statusCode: error.statusCode || 500,
    message: error.body?.errorMessage || error.body?.message || error.message || "unknown error",
  };
}

async function checkLocalSearch(credentials) {
  if (!hasCredentials(credentials)) {
    return { ok: false, skipped: true, message: "NAVER_DEVELOPERS_SEARCH_CLIENT_ID/SECRET not configured" };
  }

  try {
    const data = await fetchNaverSearchJson("/v1/search/local.json", {
      query: "서울시청",
      display: 1,
      start: 1,
      sort: "random",
    }, credentials);
    return { ok: Boolean(data.items?.length), itemCount: data.items?.length || 0 };
  } catch (error) {
    return redactError(error);
  }
}

async function checkGeocode(credentials) {
  if (!hasCredentials(credentials)) {
    return { ok: false, skipped: true, message: "NAVER_CLOUD_MAPS_NCP_KEY_ID and NAVER_CLOUD_MAPS_CLIENT_SECRET not configured" };
  }

  try {
    const data = await fetchNaverMapJson("/map-geocode/v2/geocode", {
      query: "서울특별시 중구 세종대로 110",
      count: 1,
    }, credentials);
    return { ok: Boolean(data.addresses?.length), addressCount: data.addresses?.length || 0 };
  } catch (error) {
    return redactError(error);
  }
}

async function checkDirections(credentials) {
  if (!hasCredentials(credentials)) {
    return { ok: false, skipped: true, message: "NAVER_CLOUD_MAPS_NCP_KEY_ID and NAVER_CLOUD_MAPS_CLIENT_SECRET not configured" };
  }

  try {
    const data = await fetchNaverMapJson("/map-direction/v1/driving", {
      start: "126.978388,37.566610",
      goal: "126.997642,37.610966",
      option: "traoptimal",
      lang: "ko",
    }, credentials);
    return { ok: Boolean(data.route?.traoptimal?.[0]?.path?.length), pathCount: data.route?.traoptimal?.[0]?.path?.length || 0 };
  } catch (error) {
    return redactError(error);
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "method_not_allowed" });
    return;
  }

  const mapCredentials = getNaverMapCredentials();
  const searchCredentials = getNaverSearchCredentials();
  const mapSdkKeyId = getNaverMapSdkKeyId();
  const live = req.query?.live === "1" || req.query?.live === "true";

  const payload = {
    ok: hasCredentials(mapCredentials),
    configured: {
      mapNcpKeyId: Boolean(mapSdkKeyId),
      mapClientId: Boolean(mapCredentials.clientId),
      mapClientSecret: Boolean(mapCredentials.clientSecret),
      searchClientId: Boolean(searchCredentials.clientId),
      searchClientSecret: Boolean(searchCredentials.clientSecret),
    },
    envSources: {
      mapNcpKeyId: getNaverMapSdkKeySource(),
      mapClientId: mapCredentials.sources?.clientId || null,
      mapClientSecret: mapCredentials.sources?.clientSecret || null,
      searchClientId: searchCredentials.sources?.clientId || null,
      searchClientSecret: searchCredentials.sources?.clientSecret || null,
    },
    credentialRouting: {
      mapSdk: {
        console: "Naver Cloud Platform Maps",
        purpose: "Browser Web Dynamic Map SDK",
        envSource: getNaverMapSdkKeySource(),
        expectedEnv: "NAVER_CLOUD_MAPS_NCP_KEY_ID",
      },
      geocode: {
        console: "Naver Cloud Platform Maps",
        purpose: "Maps Geocoding REST API",
        clientIdEnvSource: mapCredentials.sources?.clientId || null,
        clientSecretEnvSource: mapCredentials.sources?.clientSecret || null,
        expectedClientIdEnv: "NAVER_CLOUD_MAPS_NCP_KEY_ID",
        expectedClientSecretEnv: "NAVER_CLOUD_MAPS_CLIENT_SECRET",
      },
      directions: {
        console: "Naver Cloud Platform Maps",
        purpose: "Maps Directions 5 REST API",
        clientIdEnvSource: mapCredentials.sources?.clientId || null,
        clientSecretEnvSource: mapCredentials.sources?.clientSecret || null,
        expectedClientIdEnv: "NAVER_CLOUD_MAPS_NCP_KEY_ID",
        expectedClientSecretEnv: "NAVER_CLOUD_MAPS_CLIENT_SECRET",
      },
      localSearch: {
        console: "Naver Developers",
        purpose: "Search > Local API",
        clientIdEnvSource: searchCredentials.sources?.clientId || null,
        clientSecretEnvSource: searchCredentials.sources?.clientSecret || null,
        expectedClientIdEnv: "NAVER_DEVELOPERS_SEARCH_CLIENT_ID",
        expectedClientSecretEnv: "NAVER_DEVELOPERS_SEARCH_CLIENT_SECRET",
      },
    },
    liveChecked: live,
    mapSdkAuthHint: mapSdkKeyId ? "If the map still fails, check Naver Cloud Web Dynamic Map service URL/domain restrictions." : "Set NAVER_CLOUD_MAPS_NCP_KEY_ID.",
  };

  if (live) {
    payload.checks = {
      localSearch: await checkLocalSearch(searchCredentials),
      geocode: await checkGeocode(mapCredentials),
      directions: await checkDirections(mapCredentials),
    };
    payload.ok = payload.ok && payload.checks.geocode.ok && payload.checks.directions.ok;
    if (hasCredentials(searchCredentials)) {
      payload.ok = payload.ok && payload.checks.localSearch.ok;
    }
  }

  sendJson(res, payload.ok ? 200 : 500, payload);
};
