import { useState, useCallback } from 'react';

export function useGemini() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = useCallback(async (prompt) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '생성 실패');
      return data.text ?? '';
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { generate, loading, error };
}
