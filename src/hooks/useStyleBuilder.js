import { useState, useMemo, useCallback } from 'react';
import { TAG_GROUPS } from '../data/tags';
import { TEMPLATES } from '../data/structures';
import { STYLE_PRESETS } from '../data/presets';
import { INSTRUMENTAL_TOKEN, extractInstrumental } from '../lib/instrumental';
import { entryToBuilderState } from '../lib/promptStorage';
import { applyTagToggle, sanitizeSelection, findSoftConflicts } from '../lib/tagRules';

const PRESET_USAGE_KEY = 'suno_preset_usage';
// 인스트루멘탈이면 프롬프트에서 제외할 보컬 관련 태그 그룹.
const VOCAL_GROUP_IDS = ['vocal_arrangement', 'vocal_style'];

// 태그 value -> 한국어 label 역참조 (가사 프롬프트에 무드/장르를 한국어로 명시하기 위함).
const LABEL_BY_VALUE = Object.fromEntries(
  TAG_GROUPS.map(g => [g.id, Object.fromEntries(g.tags.map(t => [t.value, t.label]))])
);

function pickRandom(arr, min, max) {
  const n = min + Math.floor(Math.random() * (max - min + 1));
  return [...arr].sort(() => Math.random() - 0.5).slice(0, Math.min(n, arr.length));
}

function generateRandomTags() {
  const byId = Object.fromEntries(TAG_GROUPS.map(g => [g.id, g.tags.map(t => t.value)]));
  const result = {};
  result.genre = pickRandom(byId.genre, 1, 2);
  result.mood = pickRandom(byId.mood, 1, 2);
  result.vocal_arrangement = pickRandom(byId.vocal_arrangement, 1, 1);
  if (Math.random() > 0.4) result.vocal_style = pickRandom(byId.vocal_style, 1, 1);
  result.instrument = pickRandom(byId.instrument, 1, 3);
  if (Math.random() > 0.35) result.production = pickRandom(byId.production, 1, 2);
  if (Math.random() > 0.5) result.era = pickRandom(byId.era, 1, 1);
  if (Math.random() > 0.5) result.tempo = pickRandom(byId.tempo, 1, 1);
  return result;
}

function loadPresetUsage() {
  try { return JSON.parse(localStorage.getItem(PRESET_USAGE_KEY) || '{}'); } catch { return {}; }
}

// 프리셋 사용 '횟수'를 localStorage에 누적한다 — 자주 사용한 프리셋 빈도 통계용.
// ('최근 사용' 순서가 필요하면 lastUsedAt/최근 ID 배열을 별도로 기록해야 한다.)
// 목록 정렬에는 더 이상 쓰지 않으므로 React 상태로 들고 있지 않는다.
function bumpPresetUsage(presetId) {
  try {
    const usage = loadPresetUsage();
    usage[presetId] = (usage[presetId] ?? 0) + 1;
    localStorage.setItem(PRESET_USAGE_KEY, JSON.stringify(usage));
  } catch { /* localStorage 사용 불가 환경은 무시 */ }
}

function openGroupsForTags(prev, tagMap) {
  const updated = { ...prev };
  Object.keys(tagMap).forEach(id => { updated[id] = true; });
  return updated;
}

// 스타일 프롬프트 빌더의 상태와 동작을 한곳에 모은 훅.
export function useStyleBuilder() {
  const [selected, setSelected] = useState({});
  const [activePreset, setActivePreset] = useState(null);
  // URL 공유로 들어온 경우 ?p=(스타일) ?x=(제외) ?inst=(인스트루멘탈) ?vg/?wd/?si=(권장 설정)을 초기값으로 사용한다.
  // 구버전 URL은 inst 파라미터가 없으므로 p 안의 토큰 파싱으로 보완한다.
  const [initialShared] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const parsed = extractInstrumental(params.get('p') || '');
    const vg = params.get('vg');
    const wd = params.get('wd');
    const si = params.get('si');
    const advanced = ['female', 'male', 'any'].includes(vg) && wd !== null && si !== null
      ? { vocalGender: vg, weirdness: Number(wd) || 0, styleInfluence: Number(si) || 0 }
      : null;
    return {
      text: parsed.text,
      instrumental: params.get('inst') === '1' || parsed.instrumental,
      exclude: params.get('x') || '',
      advanced,
    };
  });
  const [custom, setCustom] = useState(initialShared.text);
  const [instrumental, setInstrumental] = useState(initialShared.instrumental);
  const [excludeTags, setExcludeTags] = useState([]);
  const [excludeCustom, setExcludeCustom] = useState(initialShared.exclude);
  const [vocalPrompt, setVocalPrompt] = useState('');
  // VocalCasting은 내부 상태를 갖는 컴포넌트라 초기화/불러오기 시 key로 리마운트한다.
  const [vocalResetKey, setVocalResetKey] = useState(0);
  const [expandedGroups, setExpandedGroups] = useState(
    () => Object.fromEntries(TAG_GROUPS.map((g, i) => [g.id, i < 2]))
  );
  // 프리셋이 추천하는 곡 구조 — 가사 폼에서 동기화한다.
  const [presetStructure, setPresetStructure] = useState(null);

  const prompt = useMemo(() => {
    // 인스트루멘탈이면 보컬 구성/음색/캐스팅을 프롬프트에서 제외해 모순을 원천 차단한다.
    const values = TAG_GROUPS.flatMap(g =>
      instrumental && VOCAL_GROUP_IDS.includes(g.id) ? [] : (selected[g.id] ?? [])
    );
    if (instrumental) values.unshift(INSTRUMENTAL_TOKEN);
    if (!instrumental && vocalPrompt) values.push(vocalPrompt);
    if (custom.trim()) values.push(custom.trim());
    return values.join(', ');
  }, [selected, custom, vocalPrompt, instrumental]);

  const totalSelected = useMemo(
    () => Object.values(selected).flat().length,
    [selected]
  );


  // Suno Advanced Options의 Exclude 필드에 붙여넣을 문자열.
  const excludePrompt = useMemo(() => {
    const parts = [...excludeTags];
    if (excludeCustom.trim()) parts.push(excludeCustom.trim());
    return parts.join(', ');
  }, [excludeTags, excludeCustom]);

  const toggleExclude = useCallback((value) => {
    setExcludeTags(prev => prev.includes(value) ? prev.filter(t => t !== value) : [...prev, value]);
  }, []);

  // AI 정제 API에 보낼 구조화 페이로드 — 합쳐진 문자열 대신 그룹 구조를 그대로 전달해
  // 모델이 어떤 값이 장르/무드/보컬인지 재추측하지 않게 한다.
  const refinePayload = useMemo(() => ({
    selection: Object.fromEntries(
      TAG_GROUPS
        .map(g => [g.id, instrumental && VOCAL_GROUP_IDS.includes(g.id) ? [] : (selected[g.id] ?? [])])
        .filter(([, values]) => values.length > 0)
    ),
    vocalPrompt: instrumental ? '' : vocalPrompt,
    custom: custom.trim(),
    instrumental,
    exclude: excludePrompt,
  }), [selected, vocalPrompt, custom, instrumental, excludePrompt]);

  // 인스트루멘탈 토글만 켜고 스타일 내용이 전혀 없으면 정제할 재료가 없다(API도 400을 반환).
  const canRefine = useMemo(
    () => Object.keys(refinePayload.selection).length > 0 || !!refinePayload.custom || !!refinePayload.vocalPrompt,
    [refinePayload]
  );

  // 소프트 충돌(의도된 대비일 수 있는 조합)은 자동 해제하지 않고 경고만 띄운다.
  const softConflicts = useMemo(() => findSoftConflicts(selected), [selected]);

  // 가사 생성 시 무드/장르를 한국어로 따로 강조하기 위한 힌트.
  const styleHints = useMemo(() => ({
    genre: (selected.genre ?? []).map(v => LABEL_BY_VALUE.genre?.[v] ?? v),
    mood: (selected.mood ?? []).map(v => LABEL_BY_VALUE.mood?.[v] ?? v),
  }), [selected]);

  const getGroupSelected = useCallback((groupId) => selected[groupId] ?? [], [selected]);

  // 선택 한도(단일/최대 N개)와 하드 충돌 자동 해제는 tagRules가 처리한다.
  const toggleTag = useCallback((groupId, value) => {
    setActivePreset(null);
    setSelected(prev => applyTagToggle(prev, groupId, value).selected);
  }, []);

  const isGroupAllSelected = useCallback((groupId, tags) => {
    const sel = selected[groupId] ?? [];
    return tags.length > 0 && tags.every(t => sel.includes(t.value));
  }, [selected]);

  const toggleSelectAll = useCallback((groupId, tags) => {
    setSelected(prev => {
      const allValues = tags.map(t => t.value);
      const sel = prev[groupId] ?? [];
      const allSelected = tags.length > 0 && tags.every(t => sel.includes(t.value));
      return { ...prev, [groupId]: allSelected ? [] : allValues };
    });
  }, []);

  const toggleGroup = useCallback((id) => {
    setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const applyPreset = useCallback((preset) => {
    setSelected(preset.tags);
    setActivePreset(preset.id);
    setCustom('');
    setInstrumental(!!preset.instrumental);
    setExpandedGroups(prev => openGroupsForTags(prev, preset.tags));
    if (preset.structure && TEMPLATES[preset.structure]) {
      setPresetStructure({ category: TEMPLATES[preset.structure].category, structure: preset.structure });
    }
    bumpPresetUsage(preset.id);
  }, []);

  // 프리셋 목록은 선언 순서로 고정한다 — 선택해도 카드 위치가 바뀌지 않아 위치 기억을 해치지 않는다.
  // (자주 사용/최근 사용 영역은 추후 점진적 노출 작업과 함께 별도 추가)
  const presets = STYLE_PRESETS;

  const handleRandom = useCallback(() => {
    setSelected(sanitizeSelection(generateRandomTags()));
    setActivePreset(null);
    setInstrumental(false);
    setExpandedGroups(Object.fromEntries(TAG_GROUPS.map(g => [g.id, true])));
  }, []);

  const handleReset = useCallback(() => {
    setSelected({});
    setCustom('');
    setActivePreset(null);
    setInstrumental(false);
    setExcludeTags([]);
    setExcludeCustom('');
    setVocalPrompt('');
    setVocalResetKey(k => k + 1);
  }, []);

  const applyTags = useCallback((tagMap) => {
    const clean = sanitizeSelection(tagMap);
    setSelected(clean);
    setActivePreset(null);
    setExpandedGroups(prev => openGroupsForTags(prev, clean));
  }, []);

  // 저장 프롬프트 불러오기 — 저장 당시 결과를 그대로 복원하기 위해
  // 기존 선택 태그/프리셋/보컬 캐스팅을 모두 비우고 항목 내용으로 교체한다.
  const loadPrompt = useCallback((entry) => {
    const data = typeof entry === 'string' ? { stylePrompt: entry } : (entry || {});
    const state = entryToBuilderState(data);
    setSelected({});
    setActivePreset(null);
    setVocalPrompt('');
    setVocalResetKey(k => k + 1);
    setCustom(state.custom);
    setInstrumental(state.instrumental);
    setExcludeTags([]);
    setExcludeCustom(state.exclude);
  }, []);

  return {
    selected, custom, setCustom, vocalPrompt, setVocalPrompt, vocalResetKey,
    shared: initialShared,
    expandedGroups, activePreset, prompt, totalSelected, presets, presetStructure, styleHints,
    isInstrumental: instrumental, setInstrumental,
    excludeTags, excludeCustom, setExcludeCustom, toggleExclude, excludePrompt,
    refinePayload, canRefine, softConflicts,
    getGroupSelected, isGroupAllSelected,
    toggleTag, toggleSelectAll, toggleGroup,
    applyPreset, handleRandom, handleReset, applyTags, loadPrompt,
  };
}
