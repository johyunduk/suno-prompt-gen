const TABS = [
  { id: 'basics', label: '🎓 기초 원리' },
  { id: 'builder', label: '⚡ 프롬프트 빌더' },
  { id: 'metatags', label: '🏷 메타태그' },
  { id: 'genres', label: '🎸 장르 & 스타일' },
  { id: 'structure', label: '📐 곡 구조' },
  { id: 'tips', label: '💡 전문가 팁' },
];

export default function Nav({ active, onNav }) {
  return (
    <nav id="main">
      {TABS.map(tab => (
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
