const NAVER_MAPS_BASE_URL = "https://naveropenapi.apigw.ntruss.com";
const NAVER_SEARCH_BASE_URL = "https://openapi.naver.com";

function pickEnv(names) {
  for (const name of names) {
    const value = process.env[name];
    if (value) return { value, source: name };
  }
  return { value: undefined, source: null };
}

function getNaverMapSdkKeyId() {
  const picked = pickEnv([
    "NAVER_CLOUD_MAPS_NCP_KEY_ID",
    "NAVER_MAP_NCP_KEY_ID",
    "NAVER_CLOUD_MAPS_CLIENT_ID",
    "NAVER_MAP_CLIENT_ID",
    "NAVER_MAPS_CLIENT_ID",
  ]);
  return picked.value;
}

function getNaverMapCredentials() {
  const clientId = pickEnv([
    "NAVER_CLOUD_MAPS_CLIENT_ID",
    "NAVER_MAP_CLIENT_ID",
    "NAVER_CLOUD_MAPS_NCP_KEY_ID",
    "NAVER_MAP_NCP_KEY_ID",
    "NAVER_MAPS_CLIENT_ID",
  ]);
  const clientSecret = pickEnv([
    "NAVER_CLOUD_MAPS_CLIENT_SECRET",
    "NAVER_MAP_CLIENT_SECRET",
    "NAVER_MAPS_CLIENT_SECRET",
  ]);
  return {
    clientId: clientId.value,
    clientSecret: clientSecret.value,
    sources: {
      clientId: clientId.source,
      clientSecret: clientSecret.source,
    },
  };
}

function getNaverSearchCredentials() {
  const clientId = pickEnv([
    "NAVER_DEVELOPERS_SEARCH_CLIENT_ID",
    "NAVER_SEARCH_CLIENT_ID",
    "NAVER_DEVELOPER_CLIENT_ID",
  ]);
  const clientSecret = pickEnv([
    "NAVER_DEVELOPERS_SEARCH_CLIENT_SECRET",
    "NAVER_SEARCH_CLIENT_SECRET",
    "NAVER_DEVELOPER_CLIENT_SECRET",
  ]);
  return {
    clientId: clientId.value,
    clientSecret: clientSecret.value,
    sources: {
      clientId: clientId.source,
      clientSecret: clientSecret.source,
    },
  };
}

function getNaverMapSdkKeySource() {
  return pickEnv([
    "NAVER_CLOUD_MAPS_NCP_KEY_ID",
    "NAVER_MAP_NCP_KEY_ID",
    "NAVER_CLOUD_MAPS_CLIENT_ID",
    "NAVER_MAP_CLIENT_ID",
    "NAVER_MAPS_CLIENT_ID",
  ]).source;
}

function getNaverCredentials() {
  return getNaverMapCredentials();
}

function hasCredentials(credentials) {
  return Boolean(credentials.clientId && credentials.clientSecret);
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function requireNaverMapCredentials(res) {
  const credentials = getNaverMapCredentials();
  if (!hasCredentials(credentials)) {
    sendJson(res, 500, {
      error: "missing_naver_map_credentials",
      message: "NAVER_MAP_CLIENT_ID/NAVER_CLOUD_MAPS_CLIENT_ID and NAVER_MAP_CLIENT_SECRET/NAVER_CLOUD_MAPS_CLIENT_SECRET must be configured as server environment variables.",
    });
    return null;
  }
  return credentials;
}

function requireNaverCredentials(res) {
  return requireNaverMapCredentials(res);
}

async function fetchJson(url, headers) {
  const response = await fetch(url, { headers });
  const bodyText = await response.text();
  let body;
  try {
    body = bodyText ? JSON.parse(bodyText) : {};
  } catch (error) {
    body = { raw: bodyText };
  }

  if (!response.ok) {
    const error = new Error(`Naver API failed with ${response.status}`);
    error.statusCode = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

async function fetchNaverMapJson(path, params, credentials) {
  const url = new URL(path, NAVER_MAPS_BASE_URL);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  return fetchJson(url, {
    Accept: "application/json",
    "x-ncp-apigw-api-key-id": credentials.clientId,
    "x-ncp-apigw-api-key": credentials.clientSecret,
  });
}

async function fetchNaverSearchJson(path, params, credentials) {
  const url = new URL(path, NAVER_SEARCH_BASE_URL);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  return fetchJson(url, {
    Accept: "application/json",
    "X-Naver-Client-Id": credentials.clientId,
    "X-Naver-Client-Secret": credentials.clientSecret,
  });
}

module.exports = {
  fetchNaverJson: fetchNaverMapJson,
  fetchNaverMapJson,
  fetchNaverSearchJson,
  getNaverCredentials,
  getNaverMapCredentials,
  getNaverMapSdkKeyId,
  getNaverMapSdkKeySource,
  getNaverSearchCredentials,
  hasCredentials,
  requireNaverCredentials,
  requireNaverMapCredentials,
  sendJson,
};
