import { useState, useCallback } from 'react';
import { postJSON } from '../lib/api';

const MAX_DIM = 1280;
const JPEG_QUALITY = 0.85;

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = () => reject(new Error('이미지를 읽지 못했습니다.'));
    reader.readAsDataURL(file);
  });
}

// 업로드 전 이미지를 축소해 전송 크기와 분석 지연(504 타임아웃)을 줄인다.
// 큰 이미지는 긴 변 기준 MAX_DIM로 줄여 JPEG로 인코딩하고, 실패 시 원본 base64로 폴백한다.
function prepareImage(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    const fallback = () => fileToBase64(file).then(
      (imageData) => resolve({ imageData, mimeType: file.type }),
      () => resolve(null),
    );
    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff'; // 투명 PNG → JPEG 변환 시 배경 흰색
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
        resolve({ imageData: dataUrl.split(',')[1], mimeType: 'image/jpeg' });
      } catch {
        fallback();
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      fallback();
    };
    img.src = url;
  });
}

export function useImageAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyze = useCallback(async (file) => {
    setLoading(true);
    setError('');
    try {
      const prepared = await prepareImage(file);
      if (!prepared) throw new Error('이미지를 읽지 못했습니다.');
      const { tags } = await postJSON('/api/analyze-image', prepared, { timeoutMs: 60000 });
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
