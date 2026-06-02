// Gemini API 공통 호출 헬퍼 — 모델/엔드포인트/에러 처리를 한 곳에서 관리한다.
const MODEL = 'gemini-3.5-flash';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const TIMEOUT_MS = 30000;

export class GeminiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'GeminiError';
    this.status = status;
  }
}

// Gemini를 호출하고 첫 후보의 텍스트를 반환한다. 실패 시 GeminiError를 던진다.
export async function callGemini({ contents, generationConfig }) {
  const key = process.env.GEMINI_KEY;
  if (!key) throw new GeminiError(500, 'GEMINI_KEY 환경변수가 설정되지 않았습니다.');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${API_URL}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, generationConfig }),
      signal: controller.signal,
    });
  } catch (e) {
    if (e.name === 'AbortError') throw new GeminiError(504, 'Gemini 응답 시간이 초과되었습니다.');
    throw new GeminiError(502, 'Gemini 서버에 연결하지 못했습니다.');
  } finally {
    clearTimeout(timer);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new GeminiError(502, 'Gemini 응답을 해석하지 못했습니다.');
  }

  if (!response.ok) {
    throw new GeminiError(response.status, data?.error?.message || 'Gemini 요청에 실패했습니다.');
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

// GeminiError는 해당 상태코드로, 그 외에는 500으로 응답한다. 내부 상세는 노출하지 않는다.
export function sendError(res, err) {
  const status = err instanceof GeminiError ? err.status : 500;
  res.status(status).json({ error: err.message || '서버 오류가 발생했습니다.' });
}
