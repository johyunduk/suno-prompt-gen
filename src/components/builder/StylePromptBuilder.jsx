import { useState, useRef, useEffect } from 'react';
import { TAG_GROUPS } from '../../data/tags';
import { STYLE_PRESETS } from '../../data/presets';
import CopyButton from '../ui/CopyButton';
import VocalCasting from '../VocalCasting';
import ImageAnalyzer from './ImageAnalyzer';

function encodeToURL(prompt) {
  const params = new URLSearchParams({ p: prompt });
  return `${window.location.origin}${window.location.pathname}?${params}#main`;
}

export default function StylePromptBuilder({
  style,
  storage,
  refinedPrompt,
  refining,
  refineError,
  onRefine,
  effectiveStyle,
  onGenerateLyrics,
  lyricsLoading,
}) {
  const [saveName, setSaveName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [shareMsg, setShareMsg] = useState('');
  const shareTimerRef = useRef(null);

  useEffect(() => () => clearTimeout(shareTimerRef.current), []);

  const handleShare = async () => {
    if (!effectiveStyle) return;
    await navigator.clipboard.writeText(encodeToURL(effectiveStyle));
    setShareMsg('URL 복사됨!');
    clearTimeout(shareTimerRef.current);
    shareTimerRef.current = setTimeout(() => setShareMsg(''), 2000);
  };

  const handleSave = () => {
    if (!effectiveStyle) return;
    storage.save(saveName || `Prompt ${storage.saved.length + 1}`, effectiveStyle);
    setSaveName('');
    setShowSaveInput(false);
  };

  return (
    <div className="prompt-box">
      <div className="prompt-header">
        <span>Style Prompt 생성기</span>
        <div className="prompt-header-actions">
          <button className="copy-btn" onClick={style.handleRandom}>🎲 랜덤 생성</button>
          {style.totalSelected > 0 && (
            <button className="copy-btn" onClick={style.handleReset}>전체 초기화</button>
          )}
        </div>
      </div>

      <ImageAnalyzer onApplyTags={style.applyTags} />

      {/* ── Presets ── */}
      <div className="preset-section">
        <div className="preset-section-header">
          <span className="field-label">스타일 프리셋</span>
          {style.activePreset && (
            <span className="preset-active-label">
              {STYLE_PRESETS.find(p => p.id === style.activePreset)?.emoji}{' '}
              {STYLE_PRESETS.find(p => p.id === style.activePreset)?.label} 적용 중
            </span>
          )}
        </div>
        <div className="preset-scroll">
          {style.sortedPresets.map(preset => (
            <button
              key={preset.id}
              className={`preset-card ${style.activePreset === preset.id ? 'preset-card--active' : ''}`}
              onClick={() => style.applyPreset(preset)}
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
          const allSelected = style.isGroupAllSelected(group.id, group.tags);
          return (
            <div key={group.id} className="field-group">
              <div className="group-header-row">
                <button className="group-header" onClick={() => style.toggleGroup(group.id)}>
                  <span className="field-label">{group.label}</span>
                  <span className="group-count">
                    {style.getGroupSelected(group.id).length > 0 && (
                      <span className="group-badge">{style.getGroupSelected(group.id).length}</span>
                    )}
                    <span className="group-chevron">{style.expandedGroups[group.id] ? '▲' : '▼'}</span>
                  </span>
                </button>
                <button
                  className={`tag-select-all-btn ${allSelected ? 'tag-select-all-btn--active' : ''}`}
                  onClick={() => style.toggleSelectAll(group.id, group.tags)}
                >
                  {allSelected ? '전체 해제' : '전체 선택'}
                </button>
              </div>
              {style.expandedGroups[group.id] && (
                <div className="tag-row">
                  {group.tags.map(tag => (
                    <button
                      key={tag.value}
                      className={`tag ${style.getGroupSelected(group.id).includes(tag.value) ? 'tag--selected' : ''}`}
                      onClick={() => style.toggleTag(group.id, tag.value)}
                      title={tag.value}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <div className="field-group">
          <VocalCasting onChange={style.setVocalPrompt} />
        </div>

        <div className="field-group">
          <div className="field-label">직접 입력 추가</div>
          <input
            className="field-input"
            type="text"
            placeholder="예: 90s production, heavy reverb, inspired by IU..."
            value={style.custom}
            onChange={e => style.setCustom(e.target.value)}
          />
        </div>

        <div className="output-section">
          <div className="output-header">
            <div className="field-label">
              선택한 태그
              {style.totalSelected > 0 && <span className="tag-count"> ({style.totalSelected}개 선택)</span>}
            </div>
            <div className="output-actions">
              <button className="copy-btn" onClick={handleShare}>{shareMsg || '🔗 URL 공유'}</button>
              <button className="copy-btn" onClick={() => setShowSaveInput(v => !v)}>💾 저장</button>
            </div>
          </div>
          <div className="output-area">{style.prompt || '태그를 선택하면 프롬프트가 자동 생성됩니다.'}</div>

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

          {/* ── AI 정제 ── */}
          <div className="refine-row">
            <button
              className="btn btn-primary"
              onClick={onRefine}
              disabled={refining || !style.prompt}
            >
              {refining ? '⏳ 다듬는 중...' : '✨ AI로 스타일 프롬프트 다듬기'}
            </button>
            <span className="refine-hint">선택한 태그를 자연스럽고 일관된 Suno 스타일로 변환합니다.</span>
          </div>
          {refineError && <div className="alert-error">⚠️ {refineError}</div>}

          {refinedPrompt && (
            <div className="refined-box">
              <div className="refined-box__label">✨ AI가 다듬은 Style Prompt</div>
              <div className="output-area output-area--refined">{refinedPrompt}</div>
            </div>
          )}

          <div className="style-prompt-actions">
            <button
              className="btn btn-primary"
              onClick={onGenerateLyrics}
              disabled={lyricsLoading || !effectiveStyle}
            >
              {lyricsLoading ? '⏳ 가사 생성 중...' : '✨ 가사 바로 생성'}
            </button>
            <CopyButton
              text={effectiveStyle}
              label={refinedPrompt ? '다듬은 Style Prompt 복사' : 'Style Prompt 복사'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
