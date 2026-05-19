import { useState } from 'react';
import { GENRE_PRESETS } from '../../data/genres';
import CopyButton from '../ui/CopyButton';

export default function Genres() {
  const [search, setSearch] = useState('');
  const [active, setActive] = useState(null);

  const filtered = GENRE_PRESETS.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.prompt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="section-content">
      <div className="section-label">Chapter 04</div>
      <h2 className="section-title">장르별 최적 프롬프트</h2>

      <div className="field-group" style={{ marginBottom: '1.5rem' }}>
        <input
          className="field-input"
          type="text"
          placeholder="장르 검색..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="genre-grid">
        {filtered.map(genre => (
          <div
            key={genre.name}
            className={`genre-card ${active === genre.name ? 'genre-card--active' : ''}`}
            onClick={() => setActive(active === genre.name ? null : genre.name)}
          >
            <div className="genre-emoji">{genre.emoji}</div>
            <div className="genre-name">{genre.name}</div>
            <div className="genre-tags">
              {genre.tags.slice(0, 3).map(t => (
                <span key={t} className="genre-tag">{t}</span>
              ))}
            </div>
            {active === genre.name && (
              <div className="genre-detail" onClick={e => e.stopPropagation()}>
                <div className="genre-prompt">{genre.prompt}</div>
                <CopyButton text={genre.prompt} label="Style Prompt 복사" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="divider" />

      <div className="info-block">
        💡 <strong>장르 크로스오버 전략:</strong> 두 장르를 섞을 때는 주(主) 장르를 앞에, 부(副) 장르를 뒤에.
        예: "indie pop with jazz influences" 처럼 영향받은 장르를 "with"로 연결하면 Suno가 더 정확히 해석합니다.
      </div>
    </div>
  );
}
