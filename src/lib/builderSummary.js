import { TAG_GROUPS, CORE_GROUP_IDS } from '../data/tags.js';

// 인스트루멘탈이면 집계에서 제외할 보컬 관련 태그 그룹.
const VOCAL_GROUP_IDS = ['vocal_arrangement', 'vocal_style'];

// '상세 설정' 토글 요약용 집계.
// 상세(비핵심) 그룹의 선택 태그 '개수' 합. 인스트루멘탈이면 보컬 그룹은 제외.
export function countAdvancedTags(selected, instrumental) {
  return TAG_GROUPS.reduce((n, g) => {
    if (CORE_GROUP_IDS.has(g.id)) return n;
    if (instrumental && VOCAL_GROUP_IDS.includes(g.id)) return n;
    return n + (selected[g.id]?.length ?? 0);
  }, 0);
}

// 직접 설정(보컬 캐스팅·직접 입력·Exclude) 중 값이 있는 '카테고리 수' 0~3.
// 값의 총 개수가 아니라 활성 카테고리 수다(예: 직접 입력에 단어가 여러 개여도 1).
// 인스트루멘탈이면 보컬 캐스팅은 프롬프트에서 빠지므로 집계에서 제외.
export function countActiveExtras({ vocalPrompt, custom, excludePrompt, instrumental }) {
  let n = 0;
  if (!instrumental && vocalPrompt && vocalPrompt.trim()) n += 1;
  if (custom && custom.trim()) n += 1;
  if (excludePrompt && excludePrompt.trim()) n += 1;
  return n;
}
