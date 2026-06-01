const NAVER_MAPS_BASE_URL = "https://naveropenapi.apigw.ntruss.com";

function getNaverCredentials() {
  const clientId = process.env.NAVER_MAP_CLIENT_ID || process.env.NAVER_MAPS_CLIENT_ID;
  const clientSecret = process.env.NAVER_MAP_CLIENT_SECRET || process.env.NAVER_MAPS_CLIENT_SECRET;
  return { clientId, clientSecret };
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function requireNaverCredentials(res) {
  const credentials = getNaverCredentials();
  if (!credentials.clientId || !credentials.clientSecret) {
    sendJson(res, 500, {
      error: "missing_naver_credentials",
      message: "NAVER_MAP_CLIENT_ID and NAVER_MAP_CLIENT_SECRET must be configured as server environment variables.",
    });
    return null;
  }
  return credentials;
}

async function fetchNaverJson(path, params, credentials) {
  const url = new URL(path, NAVER_MAPS_BASE_URL);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "x-ncp-apigw-api-key-id": credentials.clientId,
      "x-ncp-apigw-api-key": credentials.clientSecret,
    },
  });

  const bodyText = await response.text();
  let body;
  try {
    body = bodyText ? JSON.parse(bodyText) : {};
  } catch (error) {
    body = { raw: bodyText };
  }

  if (!response.ok) {
    const error = new Error(`Naver Maps API failed with ${response.status}`);
    error.statusCode = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

module.exports = {
  fetchNaverJson,
  getNaverCredentials,
  requireNaverCredentials,
  sendJson,
};
