const PRIMARY_TAB = { id: 'builder', label: '프롬프트 빌더' };
const REFERENCE_TABS = [
  { id: 'basics', label: '기초 원리' },
  { id: 'metatags', label: '메타태그' },
  { id: 'genres', label: '장르 & 스타일' },
  { id: 'structure', label: '곡 구조' },
  { id: 'tips', label: '전문가 팁' },
];

export default function Nav({ active, onNav }) {
  return (
    <nav id="main" aria-label="주요 내비게이션">
      <button
        className={`nav-tab nav-tab--primary ${active === PRIMARY_TAB.id ? 'active' : ''}`}
        onClick={() => onNav(PRIMARY_TAB.id)}
      >
        {PRIMARY_TAB.label}
      </button>
      <span className="nav-divider" aria-hidden="true" />
      <span className="nav-group-label" aria-hidden="true">레퍼런스</span>
      {REFERENCE_TABS.map(tab => (
        <button
          key={tab.id}
          className={`nav-tab ${active === tab.id ? 'active' : ''}`}
          onClick={() => onNav(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
