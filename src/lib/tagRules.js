import { GROUP_LIMITS, CONFLICT_PAIRS, SOFT_CONFLICT_PAIRS, TAG_GROUPS } from '../data/tags.js';

// 하드 충돌 상대 조회: value -> 충돌하는 value 목록
const CONFLICT_PARTNERS = (() => {
  const map = new Map();
  for (const [a, b] of CONFLICT_PAIRS) {
    map.set(a, [...(map.get(a) ?? []), b]);
    map.set(b, [...(map.get(b) ?? []), a]);
  }
  return map;
})();

// 태그 value -> 한국어 label (경고 메시지용)
const LABEL_BY_VALUE = new Map(
  TAG_GROUPS.flatMap(g => g.tags.map(t => [t.value, t.label]))
);
export const labelOf = (value) => LABEL_BY_VALUE.get(value) ?? value;

// 선택 맵 전체에서 특정 값들을 제거한다.
function removeValues(selected, values) {
  if (values.length === 0) return selected;
  const removeSet = new Set(values);
  const next = {};
  for (const [gid, vals] of Object.entries(selected)) {
    next[gid] = vals.filter(v => !removeSet.has(v));
  }
  return next;
}

// 태그 토글 적용 — 추가 시 하드 충돌 자동 해제 + 그룹 한도 초과면 오래된 선택부터 교체.
// 반환: { selected, released } (released: 자동 해제된 value 목록 — UI 안내용)
export function applyTagToggle(selected, groupId, value) {
  const group = selected[groupId] ?? [];

  // 해제는 규칙 적용 없이 그대로
  if (group.includes(value)) {
    return { selected: { ...selected, [groupId]: group.filter(t => t !== value) }, released: [] };
  }

  const released = [];

  // 하드 충돌 상대 자동 해제 (그룹 무관)
  const partners = CONFLICT_PARTNERS.get(value) ?? [];
  const conflicting = partners.filter(p => Object.values(selected).some(vals => vals.includes(p)));
  let next = removeValues(selected, conflicting);
  released.push(...conflicting);

  // 추가 후 한도 초과면 오래된 선택부터 해제
  let nextGroup = [...(next[groupId] ?? []), value];
  const limit = GROUP_LIMITS[groupId];
  if (limit && nextGroup.length > limit) {
    released.push(...nextGroup.slice(0, nextGroup.length - limit));
    nextGroup = nextGroup.slice(nextGroup.length - limit);
  }

  return { selected: { ...next, [groupId]: nextGroup }, released };
}

// 외부에서 들어온 선택 맵(랜덤·이미지 분석 등)을 규칙에 맞게 정리한다.
// 한도 초과분은 앞에서부터 유지하고, 하드 충돌은 먼저 선택된 쪽을 유지한다.
export function sanitizeSelection(tagMap) {
  const result = {};
  const kept = new Set();
  for (const [gid, vals] of Object.entries(tagMap)) {
    const limit = GROUP_LIMITS[gid];
    const clean = [];
    for (const v of vals) {
      const partners = CONFLICT_PARTNERS.get(v) ?? [];
      if (partners.some(p => kept.has(p))) continue; // 이미 유지된 태그와 충돌
      if (limit && clean.length >= limit) continue;
      clean.push(v);
      kept.add(v);
    }
    if (clean.length > 0) result[gid] = clean;
  }
  return result;
}

// 현재 선택에서 소프트 충돌 조합을 찾아 경고 목록을 돌려준다.
export function findSoftConflicts(selected) {
  const all = new Set(Object.values(selected).flat());
  return SOFT_CONFLICT_PAIRS
    .filter(([a, b]) => all.has(a) && all.has(b))
    .map(([a, b]) => ({ a, b, message: `'${labelOf(a)}'와(과) '${labelOf(b)}'은(는) 상충할 수 있어요 — 의도한 대비가 아니라면 하나를 빼는 게 좋아요.` }));
}
