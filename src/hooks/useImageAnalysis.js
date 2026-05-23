import { useState, useCallback } from 'react';

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function useImageAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyze = useCallback(async (file) => {
    setLoading(true);
    setError('');
    try {
      const imageData = await fileToBase64(file);
      const res = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData, mimeType: file.type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '분석 실패');
      return data.tags;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { analyze, loading, error, setError };
}
