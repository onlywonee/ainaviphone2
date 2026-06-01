function createRouteTagMatcher() {
  const { tagDictionary, tagCategoryMeta } = typeof require === "function"
    ? require("./tagDictionary")
    : window.RouteTagDictionary;

function normalizeVariant(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/[.,!?~…·ㆍ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/무서워|무서움|무섭다|무서운|무섭고|무섭네|무섭/g, "무섭")
    .replace(/막혀|막힘|막힌다|막히네|막히는|막히지|막히/g, "막히")
    .replace(/좋아|좋음|좋다|좋네|좋은|좋고|좋/g, "좋")
    .replace(/가고\s*싶어|가고\s*싶음|가고\s*싶다/g, "가고 싶")
    .replace(/싫어|싫음|싫다|싫네|싫은|싫고|싫/g, "싫")
    .replace(/복잡한|복잡함|복잡해|복잡하고|복잡/g, "복잡")
    .replace(/예뻐|예쁨|예쁘다|예쁜|예쁘고|예쁘/g, "예쁘")
    .replace(/편해|편함|편하다|편한|편하고|편하/g, "편하");
}

function normalizeText(text = "") {
  const normalized = normalizeVariant(text);
  return {
    original: String(text),
    normalized,
    compact: normalized.replace(/\s+/g, ""),
  };
}

function getKeywordForms(keyword) {
  const normalized = normalizeVariant(keyword);
  return [normalized, normalized.replace(/\s+/g, "")];
}

function findKeywordMatch(normalizedText, keyword) {
  const [keywordNormal, keywordCompact] = getKeywordForms(keyword);
  const normalIndex = normalizedText.normalized.indexOf(keywordNormal);
  const compactIndex = normalizedText.compact.indexOf(keywordCompact);
  const index = compactIndex >= 0 ? compactIndex : normalIndex;
  return index >= 0 ? { keyword, index, length: keywordCompact.length } : null;
}

function getPreferenceType(matchedTags) {
  const positiveCount = matchedTags.filter((tag) => tag.sentiment === "positive").length;
  const negativeCount = matchedTags.filter((tag) => tag.sentiment === "negative").length;
  if (positiveCount > negativeCount) return "prefer";
  if (negativeCount > positiveCount) return "avoid";
  return matchedTags.some((tag) => tag.sentiment === "positive") ? "prefer" : "avoid";
}

function buildSummary(matchedTags) {
  if (!matchedTags.length) return "감지된 키워드가 없어 직접 태그를 선택할 수 있어요.";
  const positives = matchedTags.filter((tag) => tag.sentiment === "positive").map((tag) => tag.label);
  const negatives = matchedTags.filter((tag) => tag.sentiment === "negative").map((tag) => tag.label);
  const contexts = matchedTags.filter((tag) => tag.sentiment === "neutral").map((tag) => tag.matchedKeyword);
  const parts = [];
  if (contexts.length) parts.push(`${[...new Set(contexts)].join("·")} 조건`);
  if (negatives.length) parts.push(`${[...new Set(negatives)].join("·")}은 피해서`);
  if (positives.length) parts.push(`${[...new Set(positives)].join("·")}은 반영해서`);
  return `${parts.join(", ")} 이 구간을 기억할게요.`;
}

function matchRouteSegmentTags(text = "") {
  const normalizedText = normalizeText(text);
  const candidates = [];

  Object.entries(tagDictionary).forEach(([category, keywords]) => {
    keywords.forEach((keyword) => {
      const match = findKeywordMatch(normalizedText, keyword);
      if (!match) return;
      const meta = tagCategoryMeta[category];
      candidates.push({
        category,
        label: keyword,
        sentiment: meta.sentiment,
        matchedKeyword: keyword,
        index: match.index,
        keywordLength: match.length,
      });
    });
  });

  candidates.sort((a, b) => a.index - b.index || b.keywordLength - a.keywordLength);

  const positiveTrafficRanges = candidates
    .filter((candidate) => candidate.category === "traffic_positive")
    .map((candidate) => ({ start: candidate.index, end: candidate.index + candidate.keywordLength }));

  const occupiedByCategory = new Map();
  const deduped = [];
  candidates.forEach((candidate) => {
    const categoryRanges = occupiedByCategory.get(candidate.category) || [];
    const start = candidate.index;
    const end = candidate.index + candidate.keywordLength;
    if (candidate.category === "traffic_negative") {
      const negatedByPositiveTraffic = positiveTrafficRanges.some((range) => start >= range.start && end <= range.end);
      if (negatedByPositiveTraffic) return;
    }
    const overlapsLonger = categoryRanges.some((range) => start >= range.start && end <= range.end);
    if (overlapsLonger) return;
    categoryRanges.push({ start, end });
    occupiedByCategory.set(candidate.category, categoryRanges);

    const key = `${candidate.category}:${candidate.label}`;
    if (deduped.some((tag) => `${tag.category}:${tag.label}` === key)) return;
    const { index, keywordLength, ...tag } = candidate;
    deduped.push(tag);
  });

  return {
    originalText: String(text),
    matchedTags: deduped,
    needsManualSelection: deduped.length === 0,
    preferenceType: deduped.length ? getPreferenceType(deduped) : null,
    summary: buildSummary(deduped),
  };
}

  return { normalizeText, matchRouteSegmentTags };
}

if (typeof module !== "undefined") {
  module.exports = createRouteTagMatcher();
}

if (typeof window !== "undefined") {
  window.RouteTagMatcher = createRouteTagMatcher();
}
