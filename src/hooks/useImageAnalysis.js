import { useState, useCallback } from 'react';
import { postJSON } from '../lib/api';

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = () => reject(new Error('이미지를 읽지 못했습니다.'));
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
      const { tags } = await postJSON('/api/analyze-image', { imageData, mimeType: file.type });
      return tags;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { analyze, loading, error, setError };
}
