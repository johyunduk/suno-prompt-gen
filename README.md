# 🎵 Suno Prompt Generator

Suno AI 음악 생성을 위한 **스타일 프롬프트 · 가사 생성기**. 태그를 조합해 Style Prompt를 만들고, AI로 다듬은 뒤, 그 스타일에 맞는 가사까지 한 번에 생성합니다.

## 주요 기능

- **Style Prompt 빌더** — 장르/무드/보컬/악기/프로덕션/시대/템포 태그를 조합
- **AI 정제** — 선택한 태그를 Gemini로 한 번 다듬어 자연스럽고 일관된 Suno 스타일 프롬프트로 변환
- **가사 생성** — 주제·언어·곡 구조·곡 길이를 설정하면 스타일에 맞는 가사를 생성 (인스트루멘탈 선택 시 구조 프롬프트 모드)
- **캐릭터 이미지 분석** — 이미지를 올리면 어울리는 음악 태그를 추천
- **44개 스타일 프리셋**, 곡 구조 템플릿, 메타태그/장르/팁 레퍼런스
- 프롬프트 저장(localStorage) 및 URL 공유

## 기술 스택

- React 19 + Vite
- Vercel Serverless Functions (`/api`)
- Google Gemini API

## 로컬 실행

```bash
npm install

# 프로젝트 루트에 .env.local 생성 (실제 Gemini 키로 교체)
# 키 발급: https://aistudio.google.com/apikey  (보통 AIza... 로 시작)
echo "GEMINI_KEY=AIza...your_real_key" > .env.local

npm run dev
```

> `vite.config.js`의 dev 플러그인이 개발 서버에서 `/api/*` 함수를 직접 실행하므로, `npm run dev` 하나로 AI 기능(가사/이미지/정제)까지 동작합니다. `.env.local`을 수정하면 dev 서버를 재시작해야 반영됩니다.

## 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | Vite 개발 서버 (UI) |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run lint` | ESLint 검사 |

## 배포 (Vercel)

1. 저장소를 Vercel에 연결
2. 환경변수 `GEMINI_KEY` 등록 (Project Settings → Environment Variables)
3. `/api` 폴더의 함수는 자동으로 서버리스 엔드포인트로 배포됨

## 구조

```
api/
  _lib/gemini.js     # Gemini 호출 공통 헬퍼 (모델/타임아웃/에러)
  generate.js        # 가사 생성
  refine-style.js    # 스타일 프롬프트 AI 정제
  analyze-image.js   # 이미지 → 태그 분석
src/
  components/
    builder/         # StylePromptBuilder, LyricsGenerator, ImageAnalyzer, SavedPrompts
    sections/        # Builder(컨테이너), Basics, Genres, Structure, Tips, MetaTags
  hooks/             # useStyleBuilder, useLyricsForm, useGemini, useStyleRefine, ...
  lib/api.js         # fetch 공통 헬퍼 (타임아웃/에러 파싱)
  data/              # 프리셋·태그·곡구조·장르·팁 정적 데이터
```
