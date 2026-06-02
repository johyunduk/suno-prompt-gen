import CopyButton from '../ui/CopyButton';

// 저장된 스타일 프롬프트 목록. onLoad는 항목을 직접 입력란으로 불러온다.
export default function SavedPrompts({ saved, onRemove, onLoad }) {
  if (saved.length === 0) return null;

  return (
    <div className="saved-section">
      <div className="section-label" style={{ marginBottom: '0.75rem' }}>저장된 프롬프트</div>
      <div className="saved-list">
        {saved.map(item => (
          <div key={item.id} className="saved-item">
            <div className="saved-name">{item.name}</div>
            <div className="saved-prompt">{item.prompt}</div>
            <div className="saved-actions">
              <CopyButton text={item.prompt} label="복사" />
              <button className="copy-btn" onClick={() => onLoad(item.prompt)}>불러오기</button>
              <button className="copy-btn copy-btn--danger" onClick={() => onRemove(item.id)}>삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
