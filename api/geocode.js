const {
  fetchNaverMapJson,
  fetchNaverSearchJson,
  getNaverSearchCredentials,
  hasCredentials,
  requireNaverMapCredentials,
  sendJson,
} = require("./_naver");

function stripHtml(value = "") {
  return String(value).replace(/<[^>]*>/g, "").replace(/&quot;/g, '"').replace(/&amp;/g, "&").trim();
}

async function searchLocalPlace(query) {
  const searchCredentials = getNaverSearchCredentials();
  if (!hasCredentials(searchCredentials)) return null;

  const data = await fetchNaverSearchJson("/v1/search/local.json", {
    query,
    display: 1,
    start: 1,
    sort: "random",
  }, searchCredentials);

  const item = data.items?.[0];
  if (!item) return null;

  const title = stripHtml(item.title);
  return {
    title,
    addressQuery: item.roadAddress || item.address || title || query,
    label: title || item.roadAddress || item.address || query,
    category: stripHtml(item.category),
    roadAddress: item.roadAddress,
    address: item.address,
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "method_not_allowed" });
    return;
  }

  const mapCredentials = requireNaverMapCredentials(res);
  if (!mapCredentials) return;

  const query = String(req.query?.query || req.query?.q || "").trim();
  if (!query) {
    sendJson(res, 400, { error: "missing_query", message: "query is required." });
    return;
  }

  try {
    const searchedPlace = await searchLocalPlace(query);
    const geocodeQuery = searchedPlace?.addressQuery || query;
    const data = await fetchNaverMapJson("/map-geocode/v2/geocode", { query: geocodeQuery, count: 1 }, mapCredentials);
    const firstAddress = data.addresses?.[0];
    if (!firstAddress) {
      sendJson(res, 404, { error: "destination_not_found", message: "검색 결과가 없습니다." });
      return;
    }

    sendJson(res, 200, {
      lat: Number(firstAddress.y),
      lng: Number(firstAddress.x),
      label: searchedPlace?.label || firstAddress.roadAddress || firstAddress.jibunAddress || query,
      address: firstAddress.roadAddress || firstAddress.jibunAddress || searchedPlace?.address || query,
      category: searchedPlace?.category || "",
      source: searchedPlace ? "naver-local-search+geocoding" : "naver-geocoding",
    });
  } catch (error) {
    sendJson(res, error.statusCode || 502, {
      error: "naver_geocode_failed",
      message: "네이버 장소 검색 또는 주소 검색 API 호출에 실패했습니다.",
      detail: error.body || error.message,
    });
  }
};
