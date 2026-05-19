import { useState } from 'react';
import { TEMPLATES, TEMPLATE_CATEGORIES } from '../../data/structures';
import CopyButton from '../ui/CopyButton';

const EXTEND_TIPS = [
  { title: '방법 1: 섹션 단위 분할', desc: 'Intro~Chorus 1회 생성 → Extend로 Verse 2~Chorus → 다시 Extend로 Bridge~Outro. 각 구간 가사를 정확히 넣으면 자연스럽게 이어집니다.' },
  { title: '방법 2: 마지막 4마디 겹치기', desc: 'Extend 시작점을 이전 곡의 마지막 코러스 시작으로 설정. 자연스러운 흐름 유지. 특히 발라드 아웃트로에 효과적.' },
  { title: '방법 3: 여러 버전 생성 후 선별', desc: '동일 프롬프트로 4~6개 생성 후 가장 마음에 드는 베이스를 선택. Suno는 랜덤 요소가 있어 같은 프롬프트도 매번 다름.' },
];

export default function Structure() {
  const [activeCategory, setActiveCategory] = useState('K-Pop');
  const [activeKey, setActiveKey] = useState('kpop_standard');

  const filteredTemplates = Object.entries(TEMPLATES).filter(
    ([, t]) => t.category === activeCategory
  );

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    const first = Object.entries(TEMPLATES).find(([, t]) => t.category === cat);
    if (first) setActiveKey(first[0]);
  };

  const template = TEMPLATES[activeKey];

  return (
    <div className="section-content">
      <div className="section-label">Chapter 05</div>
      <h2 className="section-title">곡 구조 설계</h2>

      <div className="info-block">
        Suno는 약 <strong>2분 분량</strong>의 곡을 기본으로 생성합니다.
        Extend 기능으로 최대 10분까지 늘릴 수 있습니다.
        처음부터 전체 구조를 설계하고 분할 생성하는 게 전문가 방식입니다.
      </div>

      {/* 카테고리 탭 */}
      <div className="structure-category-tabs">
        {TEMPLATE_CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`structure-category-tab ${activeCategory === cat ? 'structure-category-tab--active' : ''}`}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 구조 선택 */}
      <div className="structure-tabs">
        {filteredTemplates.map(([key, t]) => (
          <button
            key={key}
            className={`structure-tab ${activeKey === key ? 'structure-tab--active' : ''}`}
            onClick={() => setActiveKey(key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {template && (
        <div className="prompt-box">
          <div className="prompt-header">
            <div>
              <span>{template.label}</span>
              {template.desc && (
                <div style={{ fontSize: '0.65rem', color: '#666', marginTop: '0.3rem', fontFamily: 'Noto Sans KR, sans-serif', letterSpacing: 0 }}>
                  {template.desc}
                </div>
              )}
            </div>
            <CopyButton text={template.template} />
          </div>
          <div className="prompt-body">
            <div className="output-area" style={{ fontSize: '0.75rem', color: '#888', whiteSpace: 'pre' }}>
              {template.template}
            </div>
          </div>
        </div>
      )}

      <div className="divider" />

      <div className="section-label" style={{ marginBottom: '0.75rem' }}>Extend 전략</div>
      <div className="card-grid">
        {EXTEND_TIPS.map(tip => (
          <div key={tip.title} className="card">
            <div className="card-title">{tip.title}</div>
            <div className="card-desc">{tip.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
