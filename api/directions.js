const { fetchNaverJson, requireNaverCredentials, sendJson } = require("./_naver");

function parseCoords(value) {
  return String(value || "")
    .split("|")
    .map((pair) => pair.split(",").map((num) => Number(num.trim())))
    .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));
}

function toLngLat([lat, lng]) {
  return `${lng},${lat}`;
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "method_not_allowed" });
    return;
  }

  const credentials = requireNaverCredentials(res);
  if (!credentials) return;

  const coords = parseCoords(req.query?.coords);
  if (coords.length < 2) {
    sendJson(res, 400, { error: "missing_coords", message: "coords must contain at least start and goal coordinates." });
    return;
  }

  const start = coords[0];
  const goal = coords[coords.length - 1];
  const waypoints = coords.slice(1, -1).slice(0, 5);
  const option = String(req.query?.option || "traoptimal");

  try {
    const data = await fetchNaverJson("/map-direction/v1/driving", {
      start: toLngLat(start),
      goal: toLngLat(goal),
      waypoints: waypoints.map(toLngLat).join("|"),
      option,
      lang: "ko",
    }, credentials);

    const selectedRoute = data.route?.[option]?.[0]
      || data.route?.traoptimal?.[0]
      || Object.values(data.route || {}).flat()[0];

    if (!selectedRoute?.path?.length) {
      sendJson(res, 404, { error: "route_not_found", message: "경로를 찾을 수 없습니다.", detail: data });
      return;
    }

    sendJson(res, 200, {
      duration: Math.round((selectedRoute.summary?.duration || 0) / 1000),
      distance: selectedRoute.summary?.distance || 0,
      tollFare: selectedRoute.summary?.tollFare || 0,
      taxiFare: selectedRoute.summary?.taxiFare || 0,
      fuelPrice: selectedRoute.summary?.fuelPrice || 0,
      geometry: {
        coordinates: selectedRoute.path,
      },
      source: "naver-directions5",
    });
  } catch (error) {
    sendJson(res, error.statusCode || 502, {
      error: "naver_directions_failed",
      message: "네이버 경로 API 호출에 실패했습니다.",
      detail: error.body || error.message,
    });
  }
};
