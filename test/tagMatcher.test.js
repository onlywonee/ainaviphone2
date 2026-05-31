const assert = require("node:assert/strict");
const { matchRouteSegmentTags, normalizeText } = require("../tagMatcher");

const cases = [
  {
    text: "여기 밤에 좀 무섭고 차선도 복잡한데 야경은 좋아",
    categories: ["time_context", "safety_negative", "driving_difficult", "scenery_positive"],
  },
  {
    text: "출근시간에는 너무 막혀서 다시는 안 가고 싶어",
    categories: ["time_context", "traffic_negative", "preference_negative"],
  },
  {
    text: "도로가 넓고 직진 위주라 초보도 운전하기 편해",
    categories: ["driving_easy"],
  },
  {
    text: "비 오는 날에는 차선이 잘 안 보여서 위험해",
    categories: ["weather_context", "safety_negative"],
  },
  {
    text: "한강뷰가 예쁘고 음악 듣기 좋아서 드라이브하기 좋음",
    categories: ["scenery_positive", "mood_positive"],
  },
  {
    text: "안막힘이라 좋고 막히지 않음",
    categories: ["traffic_positive", "mood_positive"],
    excludedCategories: ["traffic_negative"],
  },
];

assert.equal(normalizeText("안 막힘").compact, normalizeText("안막힘").compact);

cases.forEach(({ text, categories, excludedCategories = [] }) => {
  const result = matchRouteSegmentTags(text);
  const actualCategories = result.matchedTags.map((tag) => tag.category);
  categories.forEach((category) => {
    assert.ok(actualCategories.includes(category), `${text} should include ${category}, got ${actualCategories.join(", ")}`);
  });
  excludedCategories.forEach((category) => {
    assert.ok(!actualCategories.includes(category), `${text} should not include ${category}, got ${actualCategories.join(", ")}`);
  });
  const keys = result.matchedTags.map((tag) => `${tag.category}:${tag.label}`);
  assert.equal(new Set(keys).size, keys.length, `${text} has duplicate category/label tags`);
});

const fallback = matchRouteSegmentTags("아무 키워드 없는 문장");
assert.equal(fallback.needsManualSelection, true);
assert.deepEqual(fallback.matchedTags, []);

console.log("tagMatcher tests passed");
