import { useState } from 'react';
import { TEMPLATES, TEMPLATE_CATEGORIES } from '../../data/structures';
import { DURATION_OPTIONS } from '../../data/tags';
import { LANG_OPTIONS, buildInstrumentalStructure } from '../../hooks/useLyricsForm';
import CopyButton from '../ui/CopyButton';

// 가사 생성 폼 + 생성 결과 표시. 프롬프트 빌드/생성은 컨테이너가 담당한다.
export default function LyricsGenerator({
  form,
  stylePrompt,
  styleHints,
  instrumental,
  onGenerate,
  loading,
  error,
  generatedLyrics,
}) {
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const lyricsPrompt = form.buildPrompt(stylePrompt, styleHints);

  const durationField = (
    <div className="field-group">
      <div className="field-label">곡 길이</div>
      <div className="tag-row">
        {DURATION_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            className={`tag ${form.duration === value ? 'tag--selected' : ''}`}
            onClick={() => form.setDuration(value)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );

  // 인스트루멘탈 모드: 가사 대신 Suno Lyrics 칸에 붙여넣을 구조 프롬프트를 만든다.
  if (instrumental) {
    const structurePrompt = buildInstrumentalStructure(form.duration);
    return (
      <>
        <div className="section-label" style={{ marginBottom: '0.75rem' }}>인스트루멘탈 구조</div>
        <div className="info-block">
          <strong>보컬 없음</strong>이 선택되어 가사 대신 곡 구조 프롬프트를 제공합니다.
          Suno에서 <strong>Instrumental</strong> 토글을 켜고, 아래 구조 태그를 Lyrics 칸에 붙여넣으세요.
        </div>

        <div className="prompt-box">
          <div className="prompt-header">
            <span>구조 프롬프트</span>
            <CopyButton text={structurePrompt} label="구조 복사" className="copy-btn--primary" />
          </div>
          <div className="prompt-body">
            {durationField}
            <div className="output-area output-area--lyrics">{structurePrompt}</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="section-label" style={{ marginBottom: '0.75rem' }}>가사 생성</div>
      <div className="info-block">
        아래 조건을 설정하고 <strong>가사 생성</strong> 버튼을 누르세요. 프롬프트만 필요하면 미리보기를 복사하세요.
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
              value={form.theme}
              onChange={e => form.setTheme(e.target.value)}
            />
          </div>

          <div className="two-col">
            <div className="field-group">
              <div className="field-label">가사 언어</div>
              <div className="tag-row">
                {LANG_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    className={`tag ${form.language === value ? 'tag--selected' : ''}`}
                    onClick={() => form.setLanguage(value)}
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
                    className={`tag ${form.category === cat ? 'tag--selected' : ''}`}
                    onClick={() => form.changeCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="tag-row">
                {Object.entries(TEMPLATES)
                  .filter(([, t]) => t.category === form.category)
                  .map(([key, { label }]) => (
                    <button
                      key={key}
                      className={`tag tag--sub ${form.structure === key ? 'tag--selected' : ''}`}
                      onClick={() => form.setStructure(key)}
                    >
                      {label}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {durationField}

          <div className="field-group">
            <div className="field-label">추가 요청 (선택)</div>
            <input
              className="field-input"
              type="text"
              placeholder="예: 비유를 많이 써줘, 후렴은 짧고 강하게, 영어 단어 섞어줘..."
              value={form.notes}
              onChange={e => form.setNotes(e.target.value)}
            />
          </div>

          <div className="output-section">
            <div className="output-header">
              <button
                className="field-label prompt-preview-toggle"
                onClick={() => setShowPromptPreview(v => !v)}
              >
                프롬프트 미리보기 {showPromptPreview ? '▲' : '▼'}
              </button>
            </div>
            {showPromptPreview && (
              <div className="output-area output-area--preview">
                {lyricsPrompt}
              </div>
            )}
            <div className="lyrics-actions">
              <button className="btn btn-primary" onClick={onGenerate} disabled={loading}>
                {loading ? '⏳ 생성 중...' : '✨ 가사 생성'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Generated Lyrics ── */}
      {error && <div className="alert-error">⚠️ {error}</div>}
      {(loading || generatedLyrics) && (
        <div className="prompt-box" style={{ marginTop: '1.5rem' }}>
          <div className="prompt-header">
            <span>생성된 가사</span>
            {generatedLyrics && <CopyButton text={generatedLyrics} label="가사 복사" />}
          </div>
          <div className="prompt-body">
            <div className="output-area output-area--lyrics">
              {loading ? '가사를 생성하고 있습니다...' : generatedLyrics}
            </div>
            {generatedLyrics && stylePrompt && (
              <div className="output-section" style={{ marginTop: '0.5rem' }}>
                <div className="output-header">
                  <div className="field-label">Suno Style Prompt</div>
                </div>
                <div className="output-area">{stylePrompt}</div>
                <CopyButton text={stylePrompt} label="Style Prompt 복사" className="copy-btn--primary" />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
