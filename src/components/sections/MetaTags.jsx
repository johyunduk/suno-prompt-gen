import { useState } from 'react';
import { METATAGS } from '../../data/metatags';

export default function MetaTags() {
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(null);

  const filtered = METATAGS.filter(m =>
    m.tag.toLowerCase().includes(search.toLowerCase()) ||
    m.effect.includes(search) ||
    m.desc.includes(search)
  );

  const handleCopy = async (tag) => {
    await navigator.clipboard.writeText(tag);
    setCopied(tag);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="section-content">
      <div className="section-label">Chapter 03</div>
      <h2 className="section-title">메타태그 완전 정복</h2>

      <div className="info-block">
        메타태그는 가사 내에 <strong>[대괄호]</strong>로 삽입합니다.
        Suno는 이 태그를 읽고 구간별 에너지, 악기 편성, 템포를 조절합니다.
        태그를 클릭하면 클립보드에 복사됩니다.
      </div>

      <div className="field-group" style={{ marginBottom: '1.5rem' }}>
        <input
          className="field-input"
          type="text"
          placeholder="태그 검색..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <table className="meta-table">
        <thead>
          <tr>
            <th>태그</th>
            <th>효과</th>
            <th>설명</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(m => (
            <tr key={m.tag}>
              <td>
                <button
                  className={`meta-tag-btn ${copied === m.tag ? 'meta-tag-btn--copied' : ''}`}
                  onClick={() => handleCopy(m.tag)}
                  title="클릭하여 복사"
                >
                  {copied === m.tag ? '✓ Copied' : m.tag}
                </button>
              </td>
              <td>{m.effect}</td>
              <td>{m.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', color: '#555', padding: '2rem', fontFamily: 'Space Mono, monospace', fontSize: '0.8rem' }}>
          검색 결과 없음
        </div>
      )}
    </div>
  );
}
