import { useState, useCallback } from 'react';
import { postJSON } from '../lib/api';

// 선택한 태그를 AI로 다듬어 더 자연스러운 Suno 스타일 프롬프트로 변환한다.
export function useStyleRefine() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refine = useCallback(async (rawPrompt) => {
    setLoading(true);
    setError('');
    try {
      const { text } = await postJSON('/api/refine-style', { rawPrompt });
      return text ?? '';
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { refine, loading, error };
}
