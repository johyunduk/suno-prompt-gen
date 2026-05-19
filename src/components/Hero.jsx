export default function Hero({ onNav }) {
  return (
    <div className="hero">
      <div className="hero-eyebrow">Complete Expert System</div>
      <h1 className="hero-title">
        SUNO AI<span>마스터클래스</span>
      </h1>
      <p className="hero-sub">
        프롬프트 설계부터 메타태그, 장르 조합, 전문가 팁까지<br />
        Suno로 진짜 음악을 만드는 법
      </p>
      <div className="hero-cta">
        <button className="btn btn-primary" onClick={() => onNav('basics')}>시작하기</button>
        <button className="btn btn-outline" onClick={() => onNav('builder')}>프롬프트 빌더</button>
      </div>
      <div className="scroll-hint">
        <span>Scroll</span>
        <div className="scroll-line" />
      </div>
    </div>
  );
}
