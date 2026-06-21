import { useState, useRef, useEffect } from 'react';
import { makeEntryData } from '../../lib/promptStorage';
import { scrollIntoViewA11y } from '../../lib/scroll';
import { buildExternalStyleRefinePrompt } from '../../lib/styleRefinePrompt';
import CopyButton from '../ui/CopyButton';

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

// 빌더 결과 패널 — Style Prompt 결과·URL 공유/저장·AI 정제 결과·다음 액션을 한곳에 모은다.
// 컨테이너(Builder)가 입력 영역과 함께 2단으로 배치하고 데스크톱에서는 sticky로 고정한다.
export default function StyleResultPanel({
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

  const externalRefinePrompt = style.canRefine
    ? buildExternalStyleRefinePrompt(style.refinePayload)
    : '';

  return (
    <div className="builder-output">
      <div className="output-section">
        <div className="output-header">
          <div className="field-label">
            선택한 태그
            {style.totalSelected > 0 && <span className="tag-count"> ({style.totalSelected}개 선택)</span>}
          </div>
          <div className="output-actions">
            <button className="copy-btn" onClick={handleShare} disabled={!effectiveStyle}>{shareMsg || 'URL 공유'}</button>
            <button className="copy-btn" onClick={() => setShowSaveInput(v => !v)} disabled={!effectiveStyle}>저장</button>
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
            {refining ? '다듬는 중…' : 'AI로 스타일 다듬기'}
          </button>
          <span className="refine-hint">
            {style.canRefine
              ? '선택한 태그를 자연스럽고 일관된 Suno 스타일로 변환합니다.'
              : '장르·무드 등 스타일 태그를 하나 이상 선택하면 다듬을 수 있습니다.'}
          </span>
        </div>
        {style.canRefine && (
          <div className="external-ai-fallback">
            <div>
              <div className="external-ai-fallback__title">Gemini 한도 초과 시</div>
              <div className="external-ai-fallback__desc">
                현재 태그를 Suno v5.5 스타일 프롬프트로 다듬는 요청문을 Claude, Codex 등에서 사용하세요.
              </div>
            </div>
            <CopyButton
              text={externalRefinePrompt}
              label="스타일 정제 요청문 복사"
              className="external-ai-fallback__copy"
            />
          </div>
        )}
        {refineError && <div className="alert-error">⚠️ {refineError}</div>}

        {refinedData && (
          <div className="refined-box" ref={refinedBoxRef}>
            <div className="refined-box__label">AI가 다듬은 결과 — Suno 입력란별로 나눠 붙여넣으세요</div>

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
              보컬 없음(인스트루멘탈)이 선택되어 가사 대신 아래 <strong>인스트루멘탈 구조</strong> 섹션의 구조 프롬프트를 사용하세요.
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
                {lyricsLoading ? '가사 생성 중…' : '현재 설정으로 바로 생성'}
              </button>
            </>
          )}
          <CopyButton
            text={effectiveStyle}
            label={refinedData ? '다듬은 Style Prompt 복사' : 'Style Prompt 복사'}
            disabled={!effectiveStyle}
          />
        </div>
      </div>
    </div>
  );
}
