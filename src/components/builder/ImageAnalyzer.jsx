import { useState, useRef, useCallback, useEffect } from 'react';
import { useImageAnalysis } from '../../hooks/useImageAnalysis';

// 캐릭터 이미지를 업로드해 어울리는 음악 태그를 추천받는 영역.
export default function ImageAnalyzer({ onApplyTags }) {
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [suggestedTags, setSuggestedTags] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const { analyze, loading: analyzing, error: analyzeError } = useImageAnalysis();

  // blob URL 메모리 정리 — imagePreview 변경 및 언마운트 시 이전 URL 해제
  useEffect(() => {
    return () => { if (imagePreview) URL.revokeObjectURL(imagePreview); };
  }, [imagePreview]);

  const resetImage = useCallback(() => {
    setImagePreview('');
    setImageFile(null);
    setSuggestedTags(null);
  }, []);

  const handleImageSelect = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setImageFile(file);
    setSuggestedTags(null);
    setImagePreview(URL.createObjectURL(file));
  }, []);

  const handleImageDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    handleImageSelect(e.dataTransfer.files[0]);
  }, [handleImageSelect]);

  const handleAnalyze = useCallback(async () => {
    if (!imageFile) return;
    const tags = await analyze(imageFile);
    if (tags) setSuggestedTags(tags);
  }, [imageFile, analyze]);

  const handleApply = useCallback(() => {
    if (!suggestedTags) return;
    onApplyTags(suggestedTags);
    resetImage();
  }, [suggestedTags, onApplyTags, resetImage]);

  return (
    <div className="image-analysis-section">
      <div className="preset-section-header">
        <span className="field-label">캐릭터 이미지로 분석</span>
        {imagePreview && (
          <button className="copy-btn" onClick={resetImage}>초기화</button>
        )}
      </div>

      {!imagePreview ? (
        <div
          className={`image-dropzone ${isDragging ? 'image-dropzone--dragging' : ''}`}
          role="button"
          tabIndex={0}
          aria-label="이미지 업로드 — 클릭하거나 이미지를 드래그하세요"
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleImageDrop}
        >
          <span className="image-dropzone-icon">🖼️</span>
          <span>클릭하거나 이미지를 드래그하세요</span>
          <span className="image-dropzone-sub">JPG, PNG, WEBP</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleImageSelect(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="image-preview-area">
          <img src={imagePreview} alt="업로드된 캐릭터" className="image-preview" />
          <div className="image-preview-actions">
            <button className="btn btn-primary" onClick={handleAnalyze} disabled={analyzing}>
              {analyzing ? '분석 중…' : '이미지 분석'}
            </button>
          </div>
          {analyzeError && <div className="alert-error">⚠️ {analyzeError}</div>}
          {suggestedTags && (
            <div className="suggested-tags-box">
              <div className="field-label" style={{ marginBottom: '0.5rem' }}>분석 결과</div>
              <div className="suggested-tags-list">
                {Object.entries(suggestedTags).map(([group, values]) => (
                  <div key={group} className="suggested-tag-group">
                    <span className="suggested-tag-group-name">{group}</span>
                    <div className="suggested-tag-values">
                      {values.map(v => <span key={v} className="suggested-tag-chip">{v}</span>)}
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary" style={{ marginTop: '0.75rem' }} onClick={handleApply}>
                태그 적용하기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
