import CopyButton from '../ui/CopyButton';

const VOCAL_GENDER_LABELS = { female: '여성', male: '남성', any: '무관' };

// 저장된 스타일 프롬프트 목록. onLoad는 항목의 구조화 데이터를 빌더로 불러온다.
export default function SavedPrompts({ saved, onRemove, onLoad }) {
  if (saved.length === 0) return null;

  return (
    <div className="saved-section">
      <div className="section-label" style={{ marginBottom: '0.75rem' }}>저장된 프롬프트</div>
      <div className="saved-list">
        {saved.map(item => (
          <div key={item.id} className="saved-item">
            <div className="saved-name">
              {item.name}
              {item.data.instrumental && ' · 🎹 인스트루멘탈'}
            </div>
            <div className="saved-prompt">{item.data.stylePrompt}</div>
            {item.data.exclude && (
              <div className="saved-prompt"><strong>Exclude:</strong> {item.data.exclude}</div>
            )}
            {item.data.advanced && (
              <div className="saved-prompt">
                보컬: {VOCAL_GENDER_LABELS[item.data.advanced.vocalGender] ?? item.data.advanced.vocalGender}
                {' · '}Weirdness {item.data.advanced.weirdness}%
                {' · '}Style Influence {item.data.advanced.styleInfluence}%
              </div>
            )}
            <div className="saved-actions">
              <CopyButton text={item.data.stylePrompt} label="복사" />
              <button className="copy-btn" onClick={() => onLoad(item.data)}>불러오기</button>
              <button className="copy-btn copy-btn--danger" onClick={() => onRemove(item.id)}>삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
