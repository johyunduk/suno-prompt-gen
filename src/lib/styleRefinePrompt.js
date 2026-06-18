import { TAG_GROUPS } from '../data/tags.js';

const GROUP_LABELS = Object.fromEntries(TAG_GROUPS.map(group => [group.id, group.label]));

export function buildExternalStyleRefinePrompt({
  selection = {},
  vocalPrompt = '',
  custom = '',
  instrumental = false,
  exclude = '',
} = {}) {
  const inputLines = Object.entries(selection)
    .filter(([, values]) => Array.isArray(values) && values.length > 0)
    .map(([groupId, values]) => `- ${GROUP_LABELS[groupId] ?? groupId}: ${values.join(', ')}`);

  if (vocalPrompt) inputLines.push(`- 보컬 캐스팅: ${vocalPrompt}`);
  if (custom) inputLines.push(`- 직접 입력: ${custom}`);
  inputLines.push(`- 인스트루멘탈: ${instrumental ? '예' : '아니요'}`);
  if (exclude) inputLines.push(`- 사용자가 제외한 요소: ${exclude}`);

  return `당신은 Suno AI v5.5용 음악 스타일 프롬프트 전문가입니다.
아래 선택값을 일관되고 구체적인 하나의 음악 방향으로 다듬어 주세요.

## 현재 선택
${inputLines.join('\n')}

## 작성 규칙
- Style of Music은 영어 쉼표 구분 설명어로 작성하고 문장·명령문·대괄호는 쓰지 마세요.
- 장르 → 무드 → 보컬 → 악기 → 프로덕션 → BPM → 조성 순으로 구성하세요.
- 핵심 정체성을 앞부분에 두고, 중복과 모순을 제거해 약 200~350자로 작성하세요.
- 보컬은 성별·구성·음색·전달 방식을 구체적으로 표현하세요.
- 인스트루멘탈이면 "instrumental"을 포함하고 보컬 설명은 제거하세요.
- 유명 아티스트나 실존 인물 이름은 절대 출력하지 말고 음악적 특성으로 치환하세요.
- 부정 표현은 Style of Music에 넣지 말고 Exclude Styles로 분리하세요.
- Exclude Styles에는 사용자가 요청한 제외 요소만 쉼표로 작성하며 "no"는 붙이지 마세요.
- Weirdness와 Style Influence는 0~100 정수로 추천하세요.

## 출력 형식
### Style of Music
\`\`\`text
(완성된 영어 스타일 프롬프트)
\`\`\`

### Exclude Styles
\`\`\`text
(없으면 "없음")
\`\`\`

### 권장 설정
\`\`\`text
보컬 성별: 여성 / 남성 / 무관
Weirdness: 숫자%
Style Influence: 숫자%
\`\`\`

### v5.5 활용 팁
(Voices, Custom Models, My Taste 중 이 스타일에 실제로 유용한 기능만 한국어 1~2문장)

해설은 최소화하고 위 형식으로만 답하세요.`;
}
