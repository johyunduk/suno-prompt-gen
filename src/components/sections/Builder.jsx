import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { TAG_GROUPS } from '../../data/tags';
import { TEMPLATES, TEMPLATE_CATEGORIES } from '../../data/structures';
import { usePromptStorage } from '../../hooks/usePromptStorage';
import CopyButton from '../ui/CopyButton';
import VocalCasting from '../VocalCasting';

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

---
위 구조 그대로 [Verse 1], [Chorus] 등 메타태그를 유지하면서 가사를 채워줘.
각 섹션의 분위기와 에너지가 자연스럽게 흐르도록 해줘.
Suno AI에 바로 넣을 수 있는 형태로 완성해줘.`;
}

function firstKeyByCategory(cat) {
  const entry = Object.entries(TEMPLATES).find(([, t]) => t.category === cat);
  return entry?.[0] ?? FALLBACK_TEMPLATE_KEY;
}

export default function Builder() {
  const [selected, setSelected] = useState({});
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
    setSelected(prev => {
      const group = prev[groupId] ?? [];
      const next = group.includes(value) ? group.filter(t => t !== value) : [...group, value];
      return { ...prev, [groupId]: next };
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

  const handleReset = () => {
    setSelected({});
    setCustom('');
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
          {totalSelected > 0 && (
            <button className="copy-btn" onClick={handleReset}>
              전체 초기화
            </button>
          )}
        </div>

        <div className="prompt-body">
          {TAG_GROUPS.map(group => (
            <div key={group.id} className="field-group">
              <button className="group-header" onClick={() => toggleGroup(group.id)}>
                <span className="field-label">{group.label}</span>
                <span className="group-count">
                  {getGroupSelected(group.id).length > 0 && (
                    <span className="group-badge">{getGroupSelected(group.id).length}</span>
                  )}
                  <span className="group-chevron">{expandedGroups[group.id] ? '▲' : '▼'}</span>
                </span>
              </button>
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
          ))}

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
                <CopyButton text={prompt} />
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
              <CopyButton text={lyricsPrompt} label="Claude 프롬프트 복사" />
            </div>
            <div className="output-area output-area--preview">
              {lyricsPrompt}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
