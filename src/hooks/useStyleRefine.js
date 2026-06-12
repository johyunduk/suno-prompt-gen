import { useState, useCallback } from 'react';
import { postJSON } from '../lib/api';

// 선택한 태그를 AI로 다듬는다. 구조화 페이로드를 보내고
// { stylePrompt, exclude, vocalGender, weirdness, styleInfluence } 객체를 돌려받는다.
export function useStyleRefine() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refine = useCallback(async (payload) => {
    setLoading(true);
    setError('');
    try {
      const { result } = await postJSON('/api/refine-style', payload);
      return result ?? null;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { refine, loading, error };
}
