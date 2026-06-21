import { TAG_GROUPS, EXCLUDE_SUGGESTIONS, GROUP_LIMITS, CORE_GROUP_IDS } from '../../data/tags';
import { STYLE_PRESETS } from '../../data/presets';
import VocalCasting from '../VocalCasting';
import ImageAnalyzer from './ImageAnalyzer';

// 스타일 빌더 입력 영역 — 프리셋·태그·상세 설정 등 사용자가 조작하는 컨트롤만 담당한다.
// 결과/정제(스티키) 패널은 컨테이너(Builder)가 StyleResultPanel로 분리 배치한다.
export default function StylePromptBuilder({ style }) {
  // 태그 그룹 하나를 렌더 — 핵심/상세 영역에서 동일하게 사용한다.
  // 인스트루멘탈이면 보컬 관련 그룹은 프롬프트에서 제외되므로 UI에서도 숨긴다.
  const renderTagGroup = (group) => {
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
  };

  // 상세 토글 요약 배지 — 활성 항목만 표기(충돌은 핵심 영역 본문으로 별도 노출).
  const advParts = [];
  if (style.advancedTagCount > 0) advParts.push(`상세 태그 ${style.advancedTagCount}`);
  if (style.extraSettingsCount > 0) advParts.push(`직접 설정 ${style.extraSettingsCount}`);
  const advBadge = advParts.join(' · ');

  return (
    <div className="prompt-box">
      <div className="prompt-header">
        <span>Style Prompt 생성기</span>
        <div className="prompt-header-actions">
          <button className="copy-btn" onClick={style.handleRandom}>랜덤 생성</button>
          {style.totalSelected > 0 && (
            <button className="copy-btn" onClick={style.handleReset}>전체 초기화</button>
          )}
        </div>
      </div>

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
          {style.presets.map(preset => (
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

      <div className="builder-body">
        <div className="field-group">
          <div className="field-label">인스트루멘탈</div>
          <div className="tag-row">
            <button
              className={`tag ${style.isInstrumental ? 'tag--selected' : ''}`}
              onClick={() => style.setInstrumental(!style.isInstrumental)}
            >
              보컬 없음 (Instrumental)
            </button>
            {style.isInstrumental && (
              <span className="refine-hint">보컬 구성·음색·캐스팅은 프롬프트에서 제외됩니다.</span>
            )}
          </div>
        </div>

        {/* 핵심 — 장르·분위기는 항상 노출 */}
        {TAG_GROUPS.filter(g => CORE_GROUP_IDS.has(g.id)).map(renderTagGroup)}

        {/* 소프트 충돌 경고 — 핵심(분위기) 태그에서 발생하므로 상세 밖에 항상 표시 */}
        {style.softConflicts.length > 0 && (
          <div className="alert-warning">
            {style.softConflicts.map(c => (
              <div key={`${c.a}-${c.b}`}>⚠️ {c.message}</div>
            ))}
          </div>
        )}

        {/* 상세 설정 — 나머지 태그 그룹·보조 입력을 단일 토글 뒤로 접는다(점진적 노출) */}
        <button
          className="advanced-toggle"
          aria-expanded={style.advancedOpen}
          aria-controls="advanced-settings-panel"
          onClick={style.toggleAdvanced}
        >
          <span className="advanced-toggle__label">
            상세 설정
            {advBadge && <span className="advanced-toggle__badge">{advBadge}</span>}
          </span>
          <span className="advanced-toggle__chevron">{style.advancedOpen ? '▲' : '▼'}</span>
        </button>

        <div className="advanced-panel" id="advanced-settings-panel" hidden={!style.advancedOpen}>
          <ImageAnalyzer onApplyTags={style.applyTags} />

          {TAG_GROUPS.filter(g => !CORE_GROUP_IDS.has(g.id)).map(renderTagGroup)}

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
        </div>
      </div>
    </div>
  );
}
