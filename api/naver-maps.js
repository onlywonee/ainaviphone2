const { getNaverCredentials } = require("./_naver");

module.exports = function handler(req, res) {
  const { clientId } = getNaverCredentials();
  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  if (!clientId) {
    res.statusCode = 200;
    res.end('window.__NAVER_MAPS_LOAD_ERROR__ = "NAVER_MAP_CLIENT_ID 환경 변수가 없어 네이버 지도를 불러오지 못했습니다. Vercel Settings > Environment Variables에 NAVER_MAP_CLIENT_ID를 추가한 뒤 Redeploy 해주세요.";');
    return;
  }

  const scriptUrl = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(clientId)}`;
  res.statusCode = 302;
  res.setHeader("Location", scriptUrl);
  res.end();
};
