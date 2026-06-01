const { fetchNaverJson, requireNaverCredentials, sendJson } = require("./_naver");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "method_not_allowed" });
    return;
  }

  const credentials = requireNaverCredentials(res);
  if (!credentials) return;

  const query = String(req.query?.query || req.query?.q || "").trim();
  if (!query) {
    sendJson(res, 400, { error: "missing_query", message: "query is required." });
    return;
  }

  try {
    const data = await fetchNaverJson("/map-geocode/v2/geocode", { query, count: 1 }, credentials);
    const firstAddress = data.addresses?.[0];
    if (!firstAddress) {
      sendJson(res, 404, { error: "destination_not_found", message: "검색 결과가 없습니다." });
      return;
    }

    sendJson(res, 200, {
      lat: Number(firstAddress.y),
      lng: Number(firstAddress.x),
      label: firstAddress.roadAddress || firstAddress.jibunAddress || query,
      source: "naver-geocoding",
    });
  } catch (error) {
    sendJson(res, error.statusCode || 502, {
      error: "naver_geocode_failed",
      message: "네이버 주소 검색 API 호출에 실패했습니다.",
      detail: error.body || error.message,
    });
  }
};
