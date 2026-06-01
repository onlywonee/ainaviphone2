const { getNaverMapSdkKeyId } = require("./_naver");

module.exports = function handler(req, res) {
  const ncpKeyId = getNaverMapSdkKeyId();
  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  if (!ncpKeyId) {
    res.statusCode = 200;
    res.end('window.__NAVER_MAPS_LOAD_ERROR__ = "NAVER_CLOUD_MAPS_NCP_KEY_ID 또는 NAVER_MAP_NCP_KEY_ID 환경 변수가 없어 네이버 지도를 불러오지 못했습니다. Vercel Settings > Environment Variables에 지도용 ncpKeyId를 추가한 뒤 Redeploy 해주세요.";');
    return;
  }

  const scriptUrl = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(ncpKeyId)}`;
  res.statusCode = 302;
  res.setHeader("Location", scriptUrl);
  res.end();
};
