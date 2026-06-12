export const TIPS = [
  {
    icon: '🎯',
    title: '아티스트명 대신 음악적 특성으로 분해',
    desc: 'Suno는 유명 아티스트·인물 이름이 들어가면 생성을 차단할 수 있습니다. 이름 대신 그 아티스트를 만드는 장르·보컬·프로덕션 특성을 풀어 쓰세요.',
    example: `❌ "inspired by IU, emotional pop"
✅ "intimate Korean indie-pop ballad, delicate female vocal,
   piano-led arrangement, restrained emotional delivery"

❌ "Frank Ocean style"
✅ "alternative R&B, introspective male falsetto,
   lush layered production, hazy atmosphere"`,
  },
  {
    icon: '🔊',
    title: '프로덕션 용어로 사운드 조각하기',
    desc: '믹싱/마스터링 용어를 추가하면 음질과 질감이 달라집니다. "lo-fi", "warm analog", "clean digital" 등으로 톤 컨트롤.',
    example: `reverb-heavy / dry signal / punchy mix / wide stereo
heavy compression / vinyl warmth / crystalline highs
muddy low-end / sidechain compression / tape saturation`,
  },
  {
    icon: '📝',
    title: '가사에 발음 힌트 넣기',
    desc: '특정 단어를 강조하거나 멜로디를 유도하려면 대문자나 대시를 사용합니다. 한국어-영어 혼용도 잘 작동합니다.',
    example: `일반: "I miss you so much"
강조: "I MISS YOU so much" (대문자 = 강세 유도)
늘이기: "I mi-iss you" (대시 = 음절 연장)
혼용: "너를 그리워해 (I miss you)" 병기 가능`,
  },
  {
    icon: '🎸',
    title: 'Instrumental 구간 전략적 삽입',
    desc: '[Instrumental break] 또는 [Guitar solo] 태그를 가사 중간에 넣으면 해당 구간에서 악기 솔로가 자동 생성됩니다.',
    example: `[Verse 2]
가사 내용...

[Instrumental break - 8 bars]

[Chorus]
가사 내용...`,
  },
  {
    icon: '🔁',
    title: '같은 코러스 반복 = 더 강한 임팩트',
    desc: '코러스 가사를 그대로 두 번 붙여넣으면 Suno가 더 웅장하게 처리합니다. [Big Chorus] 태그와 함께 사용하면 최강 조합.',
    example: `[Chorus]
(가사)

[Big Chorus]
(동일한 가사 반복)
→ Suno가 더 많은 레이어, 하모니, 악기 추가`,
  },
  {
    icon: '⚡',
    title: 'Style Prompt 길이 최적화',
    desc: 'v5.5는 구체적 디스크립터를 보상합니다. 모호한 단어 대신 구체적 디스크립터 10~15개를, 핵심 정체성은 앞쪽에. 모순 태그(예: "slow + fast paced")는 피하세요.',
    example: `❌ 너무 짧/모호: "sad song"
❌ 모호한 단어 나열: "epic, emotional, vibey, cool"
✅ 최적: "melancholic indie pop, fingerpicked acoustic guitar, breathy female vocals with airy runs, warm analog mix, vinyl warmth, 90bpm, A minor"`,
  },
  {
    icon: '🌏',
    title: '한국어 가사 잘 쓰는 법',
    desc: 'Style Prompt는 영어로, 가사만 한글로(로마자 X) 쓰는 게 안정적입니다. v5.5는 한글을 자연스럽게 부릅니다. 한 줄은 6~12음절로 짧게.',
    example: `Style Prompt (영어): "K-pop, emotional ballad, 75bpm, piano, female vocals"
Lyrics (한글):
[Verse 1]
창문 너머 비가 내려
너의 목소리가 들려

→ 한영 혼용은 한 줄 안에서 섞지 말고 섹션 단위로 분리(예: Verse 한국어, Chorus 영어)`,
  },
  {
    icon: '🔄',
    title: 'Extend 전략: 섹션 단위 분할',
    desc: 'Intro~Chorus 생성 후 Extend로 Verse 2~Chorus → 다시 Extend로 Bridge~Outro. 각 구간 가사를 정확히 넣으면 자연스럽게 이어집니다.',
    example: `1단계: [Intro] ~ [Chorus] 생성
2단계: Extend → [Verse 2] ~ [Chorus] 추가
3단계: Extend → [Bridge] ~ [Outro] 마무리
→ 총 4~6분 완성 곡 제작 가능`,
  },
  {
    icon: '🎬',
    title: '같은 프롬프트로 여러 번 생성',
    desc: 'Suno는 동일 프롬프트도 매번 다른 결과물이 나옵니다. 3~5개 생성 후 가장 좋은 것을 선택하는 게 전문가 방식.',
    example: `팁: 생성 시 "Song 2" 등 번호 붙여두기
비교 포인트: 보컬 톤, 인트로 악기, 멜로디 방향
→ 좋은 베이스 선택 후 Extend로 완성`,
  },
  {
    icon: '🎵',
    title: 'v5.5 vs v4.5 버전 전략',
    desc: 'v5.5가 기본 — 보컬·팝·멜로딕 장르에 가장 강하고 네거티브(no X) 반영이 안정적. 헤비·초고속·실험적 장르는 v4.5가 더 거칠고 자연스러울 때도 있습니다.',
    example: `v5.5 추천: K-Pop, R&B, 팝 발라드, 신스팝, 시티팝
v4.5 시도: 헤비메탈, 초고속 DnB, 거친 실험 사운드
→ 같은 프롬프트로 두 버전 비교 후 선택`,
  },
  {
    icon: '💡',
    title: '장르 크로스오버 공식',
    desc: '두 장르를 섞을 때 주 장르를 앞에, 부 장르를 뒤에. "with" 또는 "influenced by"로 연결하면 Suno가 더 정확히 해석.',
    example: `"indie pop with jazz influences"
"lo-fi hip-hop with bossa nova elements"
"K-pop inspired by 90s city pop aesthetics"
→ 주 장르의 구조 + 부 장르의 질감`,
  },
  {
    icon: '🎛',
    title: 'Remaster 활용법',
    desc: '마음에 드는 곡 구조가 나왔지만 음질이 아쉬울 때 Remaster 사용. Style Prompt를 수정하면서 Remaster하면 새로운 방향 탐색 가능.',
    example: `원본: 좋은 멜로디 구조 but 음질 아쉬움
Remaster: 동일 구조 + 더 높은 음질
Remaster + 새 Style Prompt: 구조 유지 + 질감 변경`,
  },
];
