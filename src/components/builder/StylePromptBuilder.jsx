import { useState, useRef, useEffect } from 'react';
import { TAG_GROUPS, EXCLUDE_SUGGESTIONS, GROUP_LIMITS } from '../../data/tags';
import { STYLE_PRESETS } from '../../data/presets';
import { makeEntryData } from '../../lib/promptStorage';
import CopyButton from '../ui/CopyButton';
import VocalCasting from '../VocalCasting';
import ImageAnalyzer from './ImageAnalyzer';
import { scrollIntoViewA11y } from '../../lib/scroll';

const VOCAL_GENDER_LABELS = { female: '여성', male: '남성', any: '무관 (Auto)' };

// 권장 Advanced Options를 화면 표시·복사에 동일하게 쓰는 단일 문자열로 만든다.
const formatAdvanced = (d) =>
  `보컬 성별: ${VOCAL_GENDER_LABELS[d.vocalGender] ?? d.vocalGender} · Weirdness: ${d.weirdness}% · Style Influence: ${d.styleInfluence}%`;

function encodeToURL(prompt, exclude, instrumental, advanced) {
  const params = new URLSearchParams({ p: prompt });
  if (exclude) params.set('x', exclude);
  if (instrumental) params.set('inst', '1');
  if (advanced) {
    params.set('vg', advanced.vocalGender);
    params.set('wd', String(advanced.weirdness));
    params.set('si', String(advanced.styleInfluence));
  }
  return `${window.location.origin}${window.location.pathname}?${params}#main`;
}

export default function StylePromptBuilder({
  style,
  storage,
  refinedData,
  refining,
  refineError,
  onRefine,
  refineTick,
  effectiveStyle,
  effectiveExclude,
  onGenerateLyrics,
  onGoToLyrics,
  lyricsLoading,
}) {
  const [saveName, setSaveName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [shareMsg, setShareMsg] = useState('');
  const shareTimerRef = useRef(null);
  const refinedBoxRef = useRef(null);

  useEffect(() => () => clearTimeout(shareTimerRef.current), []);

  // 정제가 완료될 때마다(첫 정제·재정제 모두) 결과 박스를 화면 안으로 가져온다.
  // refineTick은 사용자의 정제 성공 시에만 증가 → 최초 렌더·공유 URL 복원·
  // StrictMode 재마운트(tick=0)에서는 스크롤하지 않는다.
  useEffect(() => {
    if (refineTick > 0) scrollIntoViewA11y(refinedBoxRef.current, 'nearest');
  }, [refineTick]);

  const handleShare = async () => {
    if (!effectiveStyle) return;
    const advanced = refinedData
      ? { vocalGender: refinedData.vocalGender, weirdness: refinedData.weirdness, styleInfluence: refinedData.styleInfluence }
      : null;
    await navigator.clipboard.writeText(encodeToURL(effectiveStyle, effectiveExclude, style.isInstrumental, advanced));
    setShareMsg('URL 복사됨!');
    clearTimeout(shareTimerRef.current);
    shareTimerRef.current = setTimeout(() => setShareMsg(''), 2000);
  };

  const handleSave = () => {
    if (!effectiveStyle) return;
    // 구조화 저장 — Exclude/인스트루멘탈/권장 설정까지 함께 보존한다.
    // makeEntryData가 stylePrompt 속 인스트루멘탈 토큰을 분리해 중복 조립을 막는다.
    storage.save(saveName || `Prompt ${storage.saved.length + 1}`, makeEntryData({
      stylePrompt: effectiveStyle,
      exclude: effectiveExclude,
      instrumental: style.isInstrumental,
      advanced: refinedData
        ? {
            vocalGender: refinedData.vocalGender,
            weirdness: refinedData.weirdness,
            styleInfluence: refinedData.styleInfluence,
            personalization: refinedData.personalization || '',
          }
        : null,
    }));
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
        <div className="field-group">
          <div className="field-label">인스트루멘탈</div>
          <div className="tag-row">
            <button
              className={`tag ${style.isInstrumental ? 'tag--selected' : ''}`}
              onClick={() => style.setInstrumental(!style.isInstrumental)}
            >
              🎹 보컬 없음 (Instrumental)
            </button>
            {style.isInstrumental && (
              <span className="refine-hint">보컬 구성·음색·캐스팅은 프롬프트에서 제외됩니다.</span>
            )}
          </div>
        </div>

        {TAG_GROUPS.map(group => {
          // 인스트루멘탈이면 보컬 관련 그룹은 프롬프트에서 제외되므로 UI에서도 숨긴다.
          if (style.isInstrumental && (group.id === 'vocal_arrangement' || group.id === 'vocal_style')) {
            return null;
          }
          const allSelected = style.isGroupAllSelected(group.id, group.tags);
          return (
            <div key={group.id} className="field-group">
              <div className="group-header-row">
                <button
                  className="group-header"
                  aria-expanded={!!style.expandedGroups[group.id]}
                  onClick={() => style.toggleGroup(group.id)}
                >
                  <span className="field-label">
                    {group.label}
                    {GROUP_LIMITS[group.id] && (
                      <span className="refine-hint">
                        {' '}({GROUP_LIMITS[group.id] === 1 ? '단일 선택' : `최대 ${GROUP_LIMITS[group.id]}개`})
                      </span>
                    )}
                  </span>
                  <span className="group-count">
                    {style.getGroupSelected(group.id).length > 0 && (
                      <span className="group-badge">{style.getGroupSelected(group.id).length}</span>
                    )}
                    <span className="group-chevron">{style.expandedGroups[group.id] ? '▲' : '▼'}</span>
                  </span>
                </button>
                {group.selectAll !== false && !GROUP_LIMITS[group.id] && (
                  <button
                    className={`tag-select-all-btn ${allSelected ? 'tag-select-all-btn--active' : ''}`}
                    onClick={() => style.toggleSelectAll(group.id, group.tags)}
                  >
                    {allSelected ? '전체 해제' : '전체 선택'}
                  </button>
                )}
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

        {style.softConflicts.length > 0 && (
          <div className="alert-warning">
            {style.softConflicts.map(c => (
              <div key={`${c.a}-${c.b}`}>⚠️ {c.message}</div>
            ))}
          </div>
        )}

        {!style.isInstrumental && (
          <div className="field-group">
            <VocalCasting key={style.vocalResetKey} onChange={style.setVocalPrompt} />
          </div>
        )}

        <div className="field-group">
          <div className="field-label">직접 입력 추가</div>
          <input
            className="field-input"
            type="text"
            placeholder="예: 90s production, heavy reverb, intimate female vocal... (아티스트명은 생성 차단 위험)"
            value={style.custom}
            onChange={e => style.setCustom(e.target.value)}
          />
        </div>

        <div className="field-group">
          <div className="field-label">제외할 요소 (Suno의 Exclude Styles 필드용)</div>
          <div className="tag-row" style={{ marginBottom: '0.4rem' }}>
            {EXCLUDE_SUGGESTIONS.map(({ value, label }) => (
              <button
                key={value}
                className={`tag ${style.excludeTags.includes(value) ? 'tag--selected' : ''}`}
                onClick={() => style.toggleExclude(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <input
            className="field-input"
            type="text"
            placeholder="직접 입력 (영어, 쉼표로 구분): 예) trap beat, whistle"
            value={style.excludeCustom}
            onChange={e => style.setExcludeCustom(e.target.value)}
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
          {style.excludePrompt && (
            <div className="output-area" style={{ marginTop: '0.5rem' }}>
              <strong>Exclude:</strong> {style.excludePrompt}
            </div>
          )}

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
              disabled={refining || !style.canRefine}
            >
              {refining ? '⏳ 다듬는 중...' : '✨ AI로 스타일 프롬프트 다듬기'}
            </button>
            <span className="refine-hint">
              {style.canRefine
                ? '선택한 태그를 자연스럽고 일관된 Suno 스타일로 변환합니다.'
                : '장르·무드 등 스타일 태그를 하나 이상 선택하면 다듬을 수 있습니다.'}
            </span>
          </div>
          {refineError && <div className="alert-error">⚠️ {refineError}</div>}

          {refinedData && (
            <div className="refined-box" ref={refinedBoxRef}>
              <div className="refined-box__label">✨ AI가 다듬은 결과 — Suno 입력란별로 나눠 붙여넣으세요</div>

              <div className="output-header" style={{ marginTop: '0.5rem' }}>
                <div className="field-label">Style of Music</div>
                <CopyButton text={refinedData.stylePrompt} label="복사" />
              </div>
              <div className="output-area output-area--refined">{refinedData.stylePrompt}</div>

              {refinedData.exclude && (
                <>
                  <div className="output-header" style={{ marginTop: '0.5rem' }}>
                    <div className="field-label">Exclude Styles (Advanced Options)</div>
                    <CopyButton text={refinedData.exclude} label="복사" />
                  </div>
                  <div className="output-area output-area--refined">{refinedData.exclude}</div>
                </>
              )}

              <div className="output-header" style={{ marginTop: '0.5rem' }}>
                <div className="field-label">권장 Advanced Options 설정</div>
                <CopyButton text={formatAdvanced(refinedData)} label="설정 복사" />
              </div>
              <div className="output-area">{formatAdvanced(refinedData)}</div>

              {refinedData.personalization && (
                <>
                  <div className="output-header" style={{ marginTop: '0.5rem' }}>
                    <div className="field-label">v5.5 개인화 추천 (Voices · Custom Models · My Taste)</div>
                    <CopyButton text={refinedData.personalization} label="추천 복사" />
                  </div>
                  <div className="output-area">{refinedData.personalization}</div>
                </>
              )}
            </div>
          )}

          <div className="style-prompt-actions">
            {style.isInstrumental ? (
              <span className="refine-hint">
                🎹 보컬 없음(인스트루멘탈)이 선택되어 가사 대신 아래 <strong>인스트루멘탈 구조</strong> 섹션의 구조 프롬프트를 사용하세요.
              </span>
            ) : (
              <>
                <button
                  className="btn btn-primary"
                  onClick={onGoToLyrics}
                >
                  다음: 가사 설정 →
                </button>
                <button
                  className="btn btn-outline"
                  onClick={onGenerateLyrics}
                  disabled={lyricsLoading || !effectiveStyle}
                >
                  {lyricsLoading ? '⏳ 가사 생성 중...' : '현재 설정으로 바로 생성'}
                </button>
              </>
            )}
            <CopyButton
              text={effectiveStyle}
              label={refinedData ? '다듬은 Style Prompt 복사' : 'Style Prompt 복사'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
