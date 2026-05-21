import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { TAG_GROUPS } from '../../data/tags';
import { TEMPLATES, TEMPLATE_CATEGORIES } from '../../data/structures';
import { STYLE_PRESETS } from '../../data/presets';
import { usePromptStorage } from '../../hooks/usePromptStorage';
import CopyButton from '../ui/CopyButton';
import VocalCasting from '../VocalCasting';

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

const FALLBACK_TEMPLATE_KEY = Object.keys(TEMPLATES)[0];

const LANG_LABEL = {
  ko: '한국어',
  en: '영어',
  mix: '한국어와 영어를 자연스럽게 혼용해서',
};

const LANG_OPTIONS = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: '영어' },
  { value: 'mix', label: '한영 혼용' },
];

function encodeToURL(prompt) {
  const params = new URLSearchParams({ p: prompt });
  return `${window.location.origin}${window.location.pathname}?${params}#main`;
}

function buildLyricsPrompt({ stylePrompt, theme, language, structure, extraNotes }) {
  const lang = LANG_LABEL[language] ?? LANG_LABEL.ko;
  const structureText = TEMPLATES[structure]?.template ?? TEMPLATES[FALLBACK_TEMPLATE_KEY].template;

  return `다음 조건에 맞는 노래 가사를 써줘.

## 음악 스타일
${stylePrompt || '(스타일 프롬프트 없음)'}

## 가사 언어
${lang}

## 주제 / 컨셉
${theme || '자유롭게 어울리는 주제로'}

## 곡 구조 (이 구조를 반드시 따라줘)
${structureText}

## 추가 요청
${extraNotes || '없음'}

## 길이 제한 (반드시 지켜줘)
- 완성된 곡이 **3분을 넘지 않도록** 가사 분량을 조절해줘
- 각 섹션(Verse, Chorus 등)은 **4줄 이내**로 작성해줘
- Outro는 **2줄 이내**로 짧게 마무리해줘
- 반복 섹션([Chorus] 등)은 가사를 다시 쓰지 말고 구조 태그만 남겨줘

---
위 구조 그대로 [Verse 1], [Chorus] 등 메타태그를 유지하면서 가사를 채워줘.
각 섹션의 분위기와 에너지가 자연스럽게 흐르도록 해줘.
Suno AI에 바로 넣을 수 있는 형태로 완성해줘.`;
}

function firstKeyByCategory(cat) {
  const entry = Object.entries(TEMPLATES).find(([, t]) => t.category === cat);
  return entry?.[0] ?? FALLBACK_TEMPLATE_KEY;
}

const PRESET_USAGE_KEY = 'suno_preset_usage';

function loadPresetUsage() {
  try { return JSON.parse(localStorage.getItem(PRESET_USAGE_KEY) || '{}'); } catch { return {}; }
}

function sortPresetsByUsage(presets, usage) {
  return [...presets].sort((a, b) => (usage[b.id] ?? 0) - (usage[a.id] ?? 0));
}

export default function Builder() {
  const [selected, setSelected] = useState({});
  const [activePreset, setActivePreset] = useState(null);
  const [presetUsage, setPresetUsage] = useState(loadPresetUsage);
  const [custom, setCustom] = useState('');
  const [saveName, setSaveName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [shareMsg, setShareMsg] = useState('');
  const [expandedGroups, setExpandedGroups] = useState(
    () => Object.fromEntries(TAG_GROUPS.map((g, i) => [g.id, i < 2]))
  );
  const [lyricsTheme, setLyricsTheme] = useState('');
  const [lyricsLang, setLyricsLang] = useState('ko');
  const [lyricsNotes, setLyricsNotes] = useState('');
  const [lyricsCategory, setLyricsCategory] = useState('K-Pop');
  const [lyricsStructure, setLyricsStructure] = useState(FALLBACK_TEMPLATE_KEY);
  const [vocalPrompt, setVocalPrompt] = useState('');
  const shareTimerRef = useRef(null);
  const handleVocalChange = useCallback((p) => setVocalPrompt(p), []);
  const { saved, save, remove, clear } = usePromptStorage();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('p');
    if (p) setCustom(p);
  }, []);

  useEffect(() => () => clearTimeout(shareTimerRef.current), []);

  const getGroupSelected = (groupId) => selected[groupId] ?? [];

  const toggleTag = (groupId, value) => {
    setActivePreset(null);
    setSelected(prev => {
      const group = prev[groupId] ?? [];
      const next = group.includes(value) ? group.filter(t => t !== value) : [...group, value];
      return { ...prev, [groupId]: next };
    });
  };

  const isGroupAllSelected = (groupId, tags) => {
    const sel = getGroupSelected(groupId);
    return tags.length > 0 && tags.every(t => sel.includes(t.value));
  };

  const toggleSelectAll = (groupId, tags) => {
    setSelected(prev => {
      const allValues = tags.map(t => t.value);
      const sel = prev[groupId] ?? [];
      const allSelected = tags.length > 0 && tags.every(t => sel.includes(t.value));
      return { ...prev, [groupId]: allSelected ? [] : allValues };
    });
  };

  const toggleGroup = (id) => {
    setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

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

  const lyricsPrompt = useMemo(() => buildLyricsPrompt({
    stylePrompt: prompt,
    theme: lyricsTheme,
    language: lyricsLang,
    structure: lyricsStructure,
    extraNotes: lyricsNotes,
  }), [prompt, lyricsTheme, lyricsLang, lyricsStructure, lyricsNotes]);

  const handleShare = async () => {
    if (!prompt) return;
    await navigator.clipboard.writeText(encodeToURL(prompt));
    setShareMsg('URL 복사됨!');
    clearTimeout(shareTimerRef.current);
    shareTimerRef.current = setTimeout(() => setShareMsg(''), 2000);
  };

  const handleSave = () => {
    if (!prompt) return;
    save(saveName || `Prompt ${saved.length + 1}`, prompt);
    setSaveName('');
    setShowSaveInput(false);
  };

  const applyPreset = useCallback((preset) => {
    setSelected(preset.tags);
    setActivePreset(preset.id);
    setCustom('');
    setExpandedGroups(prev => {
      const updated = { ...prev };
      Object.keys(preset.tags).forEach(id => { updated[id] = true; });
      return updated;
    });
    if (preset.structure && TEMPLATES[preset.structure]) {
      const cat = TEMPLATES[preset.structure].category;
      setLyricsCategory(cat);
      setLyricsStructure(preset.structure);
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

  const handleReset = () => {
    setSelected({});
    setCustom('');
    setActivePreset(null);
    clear();
  };

  const handleCategoryChange = (cat) => {
    setLyricsCategory(cat);
    setLyricsStructure(firstKeyByCategory(cat));
  };

  return (
    <div className="section-content">
      <div className="section-label">Chapter 02</div>
      <h2 className="section-title">프롬프트 빌더</h2>

      {/* ── Style Prompt ── */}
      <div className="prompt-box">
        <div className="prompt-header">
          <span>Style Prompt 생성기</span>
          <div className="prompt-header-actions">
            <button className="copy-btn" onClick={handleRandom}>🎲 랜덤 생성</button>
            {totalSelected > 0 && (
              <button className="copy-btn" onClick={handleReset}>전체 초기화</button>
            )}
          </div>
        </div>

        {/* ── Presets ── */}
        <div className="preset-section">
          <div className="preset-section-header">
            <span className="field-label">스타일 프리셋</span>
            {activePreset && (
              <span className="preset-active-label">
                {STYLE_PRESETS.find(p => p.id === activePreset)?.emoji}{' '}
                {STYLE_PRESETS.find(p => p.id === activePreset)?.label} 적용 중
              </span>
            )}
          </div>
          <div className="preset-scroll">
            {sortedPresets.map(preset => (
              <button
                key={preset.id}
                className={`preset-card ${activePreset === preset.id ? 'preset-card--active' : ''}`}
                onClick={() => applyPreset(preset)}
                title={preset.desc}
              >
                <span className="preset-emoji">{preset.emoji}</span>
                <span className="preset-label">{preset.label}</span>
                <span className="preset-desc">{preset.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="prompt-body">
          {TAG_GROUPS.map(group => {
            const allSelected = isGroupAllSelected(group.id, group.tags);
            return (
            <div key={group.id} className="field-group">
              <div className="group-header-row">
                <button className="group-header" onClick={() => toggleGroup(group.id)}>
                  <span className="field-label">{group.label}</span>
                  <span className="group-count">
                    {getGroupSelected(group.id).length > 0 && (
                      <span className="group-badge">{getGroupSelected(group.id).length}</span>
                    )}
                    <span className="group-chevron">{expandedGroups[group.id] ? '▲' : '▼'}</span>
                  </span>
                </button>
                <button
                  className={`tag-select-all-btn ${allSelected ? 'tag-select-all-btn--active' : ''}`}
                  onClick={() => toggleSelectAll(group.id, group.tags)}
                >
                  {allSelected ? '전체 해제' : '전체 선택'}
                </button>
              </div>
              {expandedGroups[group.id] && (
                <div className="tag-row">
                  {group.tags.map(tag => (
                    <button
                      key={tag.value}
                      className={`tag ${getGroupSelected(group.id).includes(tag.value) ? 'tag--selected' : ''}`}
                      onClick={() => toggleTag(group.id, tag.value)}
                      title={tag.value}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );})}

          <div className="field-group">
            <VocalCasting onChange={handleVocalChange} />
          </div>

          <div className="field-group">
            <div className="field-label">직접 입력 추가</div>
            <input
              className="field-input"
              type="text"
              placeholder="예: 90s production, heavy reverb, inspired by IU..."
              value={custom}
              onChange={e => setCustom(e.target.value)}
            />
          </div>

          <div className="output-section">
            <div className="output-header">
              <div className="field-label">
                Suno Style Prompt
                {totalSelected > 0 && <span className="tag-count"> ({totalSelected}개 선택)</span>}
              </div>
              <div className="output-actions">
                <button className="copy-btn" onClick={handleShare}>{shareMsg || '🔗 URL 공유'}</button>
                <button className="copy-btn" onClick={() => setShowSaveInput(v => !v)}>💾 저장</button>
              </div>
            </div>
            <div className="output-area">{prompt || '태그를 선택하면 프롬프트가 자동 생성됩니다.'}</div>
            {showSaveInput && (
              <div className="save-row">
                <input
                  className="field-input"
                  type="text"
                  placeholder="프롬프트 이름 (선택)"
                  value={saveName}
                  onChange={e => setSaveName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                  autoFocus
                />
                <button className="btn btn-primary btn--sm" onClick={handleSave}>저장</button>
              </div>
            )}
            <CopyButton text={prompt} label="Suno 프롬프트 복사" className="copy-btn--primary" />
          </div>
        </div>
      </div>

      {/* ── Saved Prompts ── */}
      {saved.length > 0 && (
        <div className="saved-section">
          <div className="section-label" style={{ marginBottom: '0.75rem' }}>저장된 프롬프트</div>
          <div className="saved-list">
            {saved.map(item => (
              <div key={item.id} className="saved-item">
                <div className="saved-name">{item.name}</div>
                <div className="saved-prompt">{item.prompt}</div>
                <div className="saved-actions">
                  <CopyButton text={item.prompt} label="복사" />
                  <button className="copy-btn" onClick={() => setCustom(item.prompt)}>불러오기</button>
                  <button className="copy-btn copy-btn--danger" onClick={() => remove(item.id)}>삭제</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="divider" />

      {/* ── Lyrics Prompt Generator ── */}
      <div className="section-label" style={{ marginBottom: '0.75rem' }}>가사 생성 프롬프트</div>
      <div className="info-block">
        아래 조건을 채운 뒤 <strong>Claude에게 줄 프롬프트 복사</strong>를 클릭하세요.
        복사한 텍스트를 그대로 Claude에 붙여넣으면 완성된 가사를 받을 수 있습니다.
      </div>

      <div className="prompt-box">
        <div className="prompt-header">
          <span>가사 조건 설정</span>
        </div>
        <div className="prompt-body">
          <div className="field-group">
            <div className="field-label">주제 / 컨셉 (선택)</div>
            <input
              className="field-input"
              type="text"
              placeholder="예: 이별 후 홀로 남은 밤, 처음 만난 설렘, 도시에서의 외로움..."
              value={lyricsTheme}
              onChange={e => setLyricsTheme(e.target.value)}
            />
          </div>

          <div className="two-col">
            <div className="field-group">
              <div className="field-label">가사 언어</div>
              <div className="tag-row">
                {LANG_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    className={`tag ${lyricsLang === value ? 'tag--selected' : ''}`}
                    onClick={() => setLyricsLang(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="field-group">
              <div className="field-label">곡 구조</div>
              <div className="tag-row" style={{ marginBottom: '0.4rem' }}>
                {TEMPLATE_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    className={`tag ${lyricsCategory === cat ? 'tag--selected' : ''}`}
                    onClick={() => handleCategoryChange(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="tag-row">
                {Object.entries(TEMPLATES)
                  .filter(([, t]) => t.category === lyricsCategory)
                  .map(([key, { label }]) => (
                    <button
                      key={key}
                      className={`tag tag--sub ${lyricsStructure === key ? 'tag--selected' : ''}`}
                      onClick={() => setLyricsStructure(key)}
                    >
                      {label}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          <div className="field-group">
            <div className="field-label">추가 요청 (선택)</div>
            <input
              className="field-input"
              type="text"
              placeholder="예: 비유를 많이 써줘, 후렴은 짧고 강하게, 영어 단어 섞어줘..."
              value={lyricsNotes}
              onChange={e => setLyricsNotes(e.target.value)}
            />
          </div>

          <div className="output-section">
            <div className="output-header">
              <div className="field-label">Claude에게 줄 프롬프트 미리보기</div>
            </div>
            <div className="output-area output-area--preview">
              {lyricsPrompt}
            </div>
            <CopyButton text={lyricsPrompt} label="Claude 가사 프롬프트 복사" className="copy-btn--primary" />
          </div>
        </div>
      </div>
    </div>
  );
}
