export default function Hero({ onNav }) {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <span className="app-header__eyebrow">Suno Prompt Studio</span>
        <span className="app-header__title">스타일 프롬프트 &amp; 가사 생성기</span>
      </div>
      <button className="btn btn-primary btn--sm" onClick={() => onNav('builder')}>
        빌더 열기
      </button>
    </header>
  );
}
