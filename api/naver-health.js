const {
  fetchNaverMapJson,
  fetchNaverSearchJson,
  getNaverMapCredentials,
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
    return { ok: false, skipped: true, message: "NAVER_SEARCH_CLIENT_ID/SECRET not configured" };
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
    return { ok: false, skipped: true, message: "NAVER_MAP_CLIENT_ID/SECRET not configured" };
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
    return { ok: false, skipped: true, message: "NAVER_MAP_CLIENT_ID/SECRET not configured" };
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
  const live = req.query?.live === "1" || req.query?.live === "true";

  const payload = {
    ok: hasCredentials(mapCredentials),
    configured: {
      mapClientId: Boolean(mapCredentials.clientId),
      mapClientSecret: Boolean(mapCredentials.clientSecret),
      searchClientId: Boolean(searchCredentials.clientId),
      searchClientSecret: Boolean(searchCredentials.clientSecret),
    },
    liveChecked: live,
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
