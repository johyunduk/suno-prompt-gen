// 데이터 무결성 검사 — 프리셋 태그가 전부 tags.js(단일 원본)에 존재하는지 확인한다.
// 사용: npm run check:data (build 전에 자동 실행됨)
import { TAG_GROUPS } from '../src/data/tags.js';
import { STYLE_PRESETS } from '../src/data/presets.js';
import { TEMPLATES } from '../src/data/structures.js';

let errors = 0;
const fail = (msg) => { console.error(`✗ ${msg}`); errors++; };

const validByGroup = Object.fromEntries(
  TAG_GROUPS.map(g => [g.id, new Set(g.tags.map(t => t.value))])
);

// 1. 프리셋 태그가 모두 실제 태그 그룹/값을 가리키는지
for (const preset of STYLE_PRESETS) {
  for (const [groupId, values] of Object.entries(preset.tags)) {
    const valid = validByGroup[groupId];
    if (!valid) { fail(`프리셋 "${preset.id}": 존재하지 않는 태그 그룹 "${groupId}"`); continue; }
    for (const v of values) {
      if (!valid.has(v)) fail(`프리셋 "${preset.id}": ${groupId}에 없는 태그 "${v}"`);
    }
  }
  // 2. 프리셋이 추천하는 곡 구조가 실제 템플릿인지
  if (preset.structure && !TEMPLATES[preset.structure]) {
    fail(`프리셋 "${preset.id}": 존재하지 않는 곡 구조 "${preset.structure}"`);
  }
  // 3. 인스트루멘탈 프리셋은 보컬 태그를 가질 수 없다
  if (preset.instrumental && (preset.tags.vocal_arrangement || preset.tags.vocal_style)) {
    fail(`프리셋 "${preset.id}": instrumental인데 보컬 태그가 있음`);
  }
}

// 4. 태그 값 중복(같은 그룹 내) 검사
for (const g of TAG_GROUPS) {
  const seen = new Set();
  for (const t of g.tags) {
    if (seen.has(t.value)) fail(`태그 그룹 "${g.id}": 중복 값 "${t.value}"`);
    seen.add(t.value);
  }
}

if (errors > 0) {
  console.error(`\n데이터 검사 실패: ${errors}건`);
  process.exit(1);
}
console.log(`✓ 데이터 검사 통과 — 프리셋 ${STYLE_PRESETS.length}개, 태그 그룹 ${TAG_GROUPS.length}개, 구조 템플릿 ${Object.keys(TEMPLATES).length}개`);
