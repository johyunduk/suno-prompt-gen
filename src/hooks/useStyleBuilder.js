import { useState, useMemo, useCallback } from 'react';
import { TAG_GROUPS } from '../data/tags';
import { TEMPLATES } from '../data/structures';
import { STYLE_PRESETS } from '../data/presets';

const PRESET_USAGE_KEY = 'suno_preset_usage';

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
  // URL 공유로 들어온 경우 ?p= 값을 직접 입력란 초기값으로 사용한다.
  const [custom, setCustom] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('p') || '';
  });
  const [vocalPrompt, setVocalPrompt] = useState('');
  const [expandedGroups, setExpandedGroups] = useState(
    () => Object.fromEntries(TAG_GROUPS.map((g, i) => [g.id, i < 2]))
  );
  // 프리셋이 추천하는 곡 구조 — 가사 폼에서 동기화한다.
  const [presetStructure, setPresetStructure] = useState(null);

  const prompt = useMemo(() => {
    const values = TAG_GROUPS.flatMap(g => selected[g.id] ?? []);
    if (vocalPrompt) values.push(vocalPrompt);
    if (custom.trim()) values.push(custom.trim());
    return values.join(', ');
  }, [selected, custom, vocalPrompt]);

  const totalSelected = useMemo(
    () => Object.values(selected).flat().length,
    [selected]
  );

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
    setExpandedGroups(Object.fromEntries(TAG_GROUPS.map(g => [g.id, true])));
  }, []);

  const handleReset = useCallback(() => {
    setSelected({});
    setCustom('');
    setActivePreset(null);
  }, []);

  const applyTags = useCallback((tagMap) => {
    setSelected(tagMap);
    setActivePreset(null);
    setExpandedGroups(prev => openGroupsForTags(prev, tagMap));
  }, []);

  return {
    selected, custom, setCustom, vocalPrompt, setVocalPrompt,
    expandedGroups, activePreset, prompt, totalSelected, sortedPresets, presetStructure,
    getGroupSelected, isGroupAllSelected,
    toggleTag, toggleSelectAll, toggleGroup,
    applyPreset, handleRandom, handleReset, applyTags,
  };
}
