import { useState, useMemo, useCallback } from 'react';
import { TAG_GROUPS } from '../data/tags';
import { TEMPLATES } from '../data/structures';
import { STYLE_PRESETS } from '../data/presets';
import { INSTRUMENTAL_TOKEN, extractInstrumental } from '../lib/instrumental';

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

function sortPresetsByUsage(presets, usage) {
  return [...presets].sort((a, b) => (usage[b.id] ?? 0) - (usage[a.id] ?? 0));
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
  const [presetUsage, setPresetUsage] = useState(loadPresetUsage);
  // URL 공유로 들어온 경우 ?p= 값을 파싱해 인스트루멘탈 여부와 직접 입력 초기값으로 나눈다.
  const [initialShared] = useState(() =>
    extractInstrumental(new URLSearchParams(window.location.search).get('p') || '')
  );
  const [custom, setCustom] = useState(initialShared.text);
  const [instrumental, setInstrumental] = useState(initialShared.instrumental);
  const [vocalPrompt, setVocalPrompt] = useState('');
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


  // 가사 생성 시 무드/장르를 한국어로 따로 강조하기 위한 힌트.
  const styleHints = useMemo(() => ({
    genre: (selected.genre ?? []).map(v => LABEL_BY_VALUE.genre?.[v] ?? v),
    mood: (selected.mood ?? []).map(v => LABEL_BY_VALUE.mood?.[v] ?? v),
  }), [selected]);

  const getGroupSelected = useCallback((groupId) => selected[groupId] ?? [], [selected]);

  const toggleTag = useCallback((groupId, value) => {
    setActivePreset(null);
    setSelected(prev => {
      const group = prev[groupId] ?? [];
      const next = group.includes(value) ? group.filter(t => t !== value) : [...group, value];
      return { ...prev, [groupId]: next };
    });
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
    setPresetUsage(prev => {
      const next = { ...prev, [preset.id]: (prev[preset.id] ?? 0) + 1 };
      localStorage.setItem(PRESET_USAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const sortedPresets = useMemo(
    () => sortPresetsByUsage(STYLE_PRESETS, presetUsage),
    [presetUsage]
  );

  const handleRandom = useCallback(() => {
    setSelected(generateRandomTags());
    setActivePreset(null);
    setInstrumental(false);
    setExpandedGroups(Object.fromEntries(TAG_GROUPS.map(g => [g.id, true])));
  }, []);

  const handleReset = useCallback(() => {
    setSelected({});
    setCustom('');
    setActivePreset(null);
    setInstrumental(false);
  }, []);

  const applyTags = useCallback((tagMap) => {
    setSelected(tagMap);
    setActivePreset(null);
    setExpandedGroups(prev => openGroupsForTags(prev, tagMap));
  }, []);

  // 저장 프롬프트 불러오기 — 인스트루멘탈 토큰을 분리해 전용 상태로 복원한다.
  const loadPrompt = useCallback((text) => {
    const parsed = extractInstrumental(text || '');
    setCustom(parsed.text);
    setInstrumental(parsed.instrumental);
  }, []);

  return {
    selected, custom, setCustom, vocalPrompt, setVocalPrompt,
    expandedGroups, activePreset, prompt, totalSelected, sortedPresets, presetStructure, styleHints,
    isInstrumental: instrumental, setInstrumental,
    getGroupSelected, isGroupAllSelected,
    toggleTag, toggleSelectAll, toggleGroup,
    applyPreset, handleRandom, handleReset, applyTags, loadPrompt,
  };
}
