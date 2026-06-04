const BASICS = [
  { num: '01', title: 'Style Prompt', desc: '장르, 악기, 분위기, BPM, 보컬 스타일을 콤마로 나열. Suno는 이 텍스트를 음악적 DNA로 해석합니다. v5.5는 모호한 단어보다 구체적 디스크립터를 보상하니 10~15개를 구체적으로, 핵심 정체성은 앞쪽에.' },
  { num: '02', title: 'Lyrics + Meta Tags', desc: '대괄호 [Verse], [Chorus] 등으로 곡 구조를 지정. Suno는 이 구조에 맞게 멜로디와 에너지를 자동 조절합니다.' },
  { num: '03', title: 'Custom Mode vs Simple', desc: 'Custom Mode에서만 Style Prompt와 Lyrics를 분리 제어 가능. Simple은 AI가 다 결정 — 전문가는 반드시 Custom Mode 사용.' },
  { num: '04', title: 'Extend & Continue', desc: '생성된 곡을 Extend하면 일관된 스타일로 이어집니다. 브리지, 아웃트로 추가에 필수. Continue from clip으로 세밀하게 연결.' },
  { num: '05', title: 'Remaster 기능', desc: '기존 생성 결과물을 더 높은 퀄리티로 재처리. v5.5 모델로 업그레이드하면 음질과 구성이 개선됩니다.' },
  { num: '06', title: '버전 선택 전략', desc: 'v5.5가 기본 — 보컬·팝·멜로딕 장르에 가장 강하고 한 번에 최대 8분까지 생성. 헤비메탈·초고속·실험적 장르는 v4.5가 더 자연스러울 때도 있으니 비교해보세요.' },
  { num: '07', title: '생성 수량 전략', desc: '동일 프롬프트로 3~5개 동시 생성 후 최고 선별. Suno는 랜덤 요소가 있어 같은 프롬프트도 매번 결과가 다릅니다.' },
  { num: '08', title: 'Song Cover & Title', desc: '커버 이미지와 제목은 음악에 직접 영향을 주지 않지만, 포트폴리오 완성도를 높입니다. Midjourney로 커버를 별도 제작하세요.' },
];

export default function Basics() {
  return (
    <div className="section-content">
      <div className="section-label">Chapter 01</div>
      <h2 className="section-title">Suno가 이해하는 것들</h2>

      <div className="info-block">
        Suno AI는 <strong>Style Prompt</strong>(음악 스타일) + <strong>Lyrics</strong>(가사/메타태그) 두 채널로 작동합니다.
        각 채널을 분리해서 정확하게 제어하는 게 전문가와 초보의 차이입니다.
      </div>

      <div className="card-grid">
        {BASICS.map(item => (
          <div key={item.num} className="card">
            <div className="card-num">{item.num}</div>
            <div className="card-title">{item.title}</div>
            <div className="card-desc">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
