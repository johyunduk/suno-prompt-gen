export const TIPS = [
  {
    icon: '🎯',
    title: '구체적 레퍼런스 아티스트 사용',
    desc: '장르 단어보다 "inspired by [아티스트]"가 더 정확합니다. Suno는 유명 아티스트의 프로덕션 스타일을 학습했습니다.',
    example: `❌ "emotional pop music"
✅ "inspired by IU, Lauv-style production, intimate acoustic pop"

❌ "hip-hop"
✅ "inspired by Frank Ocean, alternative R&B, introspective, lush production"`,
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
    desc: '너무 짧으면 방향성 부족, 너무 길면 혼란. 핵심 단어 5~10개가 최적. 모순되는 태그(예: "slow + fast paced")는 피하세요.',
    example: `❌ 너무 짧: "sad song"
❌ 너무 길: (30단어 이상 모든 요소 나열)
✅ 최적: "melancholic indie pop, fingerpicked guitar, breathy female vocals, 90bpm, reverb-heavy, lo-fi production"`,
  },
  {
    icon: '🌏',
    title: '한국어 가사 잘 쓰는 법',
    desc: 'Style Prompt는 영어로, 가사만 한국어로 쓰는 게 더 안정적입니다. v4에서 한국어 처리가 크게 개선되었습니다.',
    example: `Style Prompt (영어): "K-pop, emotional ballad, 75bpm, piano, female vocals"
Lyrics (한국어):
[Verse 1]
창문 너머 비가 내려
너의 목소리가 들려

→ 한영 혼용 가사도 자연스럽게 작동`,
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
    title: 'v3 vs v4 버전 전략',
    desc: 'v4가 기본이지만 특정 장르는 v3.5가 더 자연스럽습니다. 레트로, 로파이, 재즈는 v3.5를 시도해보세요.',
    example: `v4 추천: K-Pop, EDM, 팝 발라드, 신스팝
v3.5 추천: Lo-Fi, Vintage Jazz, 레트로 팝, Vaporwave
→ 결과를 비교해보고 더 나은 버전 선택`,
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
