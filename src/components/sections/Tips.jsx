import { useState } from 'react';
import { TIPS } from '../../data/tips';

export default function Tips() {
  const [open, setOpen] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = TIPS.filter(t =>
    t.title.includes(search) || t.desc.includes(search)
  );

  return (
    <div className="section-content">
      <div className="section-label">Chapter 06</div>
      <h2 className="section-title">전문가 팁 & 트릭</h2>

      <div className="field-group" style={{ marginBottom: '1.5rem' }}>
        <input
          className="field-input"
          type="text"
          placeholder="팁 검색..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="tip-list">
        {filtered.map((tip, i) => (
          <button
            key={i}
            className={`tip-item ${open === i ? 'tip-item--open' : ''}`}
            onClick={() => setOpen(open === i ? null : i)}
          >
            <div className="tip-icon">{tip.icon}</div>
            <div className="tip-content">
              <div className="tip-title">{tip.title}</div>
              <div className="tip-desc">{tip.desc}</div>
              {open === i && (
                <div className="tip-example">{tip.example}</div>
              )}
            </div>
            <div className="tip-chevron">{open === i ? '▲' : '▼'}</div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', color: '#555', padding: '2rem', fontFamily: 'Space Mono, monospace', fontSize: '0.8rem' }}>
          검색 결과 없음
        </div>
      )}

      <div className="divider" />
      <div className="info-block">
        🏆 <strong>마스터 루틴:</strong> Style Prompt 작성 → Custom Mode 진입 → 가사+메타태그 입력
        → 3~5개 동시 생성 → 최고 결과물 선택 → Extend로 전체 구조 완성 → 필요시 Remaster
      </div>
    </div>
  );
}
