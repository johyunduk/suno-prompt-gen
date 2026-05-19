import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import CopyButton from './ui/CopyButton';

const GENDERS = [
  { value: 'female', label: '여성' },
  { value: 'male', label: '남성' },
];

const ROLES = [
  { value: 'lead vocals', label: '리드' },
  { value: 'backing harmonies', label: '화음/백킹' },
  { value: 'rapper', label: '랩' },
  { value: 'hook singer', label: '훅' },
  { value: 'narrator', label: '내레이션' },
];

const STYLES = [
  { value: 'breathy', label: '숨결 섞인' },
  { value: 'raspy', label: '허스키한' },
  { value: 'smooth', label: '부드러운' },
  { value: 'powerful', label: '파워풀' },
  { value: 'falsetto', label: '팔세토' },
  { value: 'whisper', label: '속삭임' },
  { value: 'croon', label: '크루닝' },
  { value: 'operatic', label: '오페라틱' },
  { value: 'autotuned', label: '오토튠' },
  { value: 'vibrato', label: '비브라토' },
  { value: 'deep', label: '낮은 음역' },
  { value: 'high-pitched', label: '높은 음역' },
  { value: 'nasal', label: '비음' },
  { value: 'melodic rap flow', label: '멜로딕 랩' },
  { value: 'aggressive rap', label: '공격적 랩' },
];

function buildVocalPrompt(vocalists) {
  if (vocalists.length === 0) return '';
  return vocalists
    .map(v => {
      const styles = v.styles.join(', ');
      const base = `${v.gender} ${v.role}`;
      return styles ? `${base} with ${styles}` : base;
    })
    .join(', ');
}

export default function VocalCasting({ onChange }) {
  const [vocalists, setVocalists] = useState([]);
  const idRef = useRef(1);

  const prompt = useMemo(() => buildVocalPrompt(vocalists), [vocalists]);

  useEffect(() => {
    onChange?.(prompt);
  }, [prompt, onChange]);

  const addVocalist = useCallback(() => {
    const id = idRef.current++;
    setVocalists(prev => [...prev, { id, gender: 'female', role: 'lead vocals', styles: [] }]);
  }, []);

  const removeVocalist = useCallback((id) => {
    setVocalists(prev => prev.filter(v => v.id !== id));
  }, []);

  const setField = useCallback((id, field, value) => {
    setVocalists(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  }, []);

  const toggleStyle = useCallback((id, style) => {
    setVocalists(prev => prev.map(v => {
      if (v.id !== id) return v;
      const styles = v.styles.includes(style)
        ? v.styles.filter(s => s !== style)
        : [...v.styles, style];
      return { ...v, styles };
    }));
  }, []);

  return (
    <div className="vocal-casting">
      <div className="vocal-casting-header">
        <span className="field-label">보컬 캐스팅</span>
        <button className="copy-btn vocal-add-btn" onClick={addVocalist}>
          + 보컬 추가
        </button>
      </div>

      {vocalists.length === 0 && (
        <div className="vocal-empty">
          보컬을 추가하면 각자의 성별, 역할, 음색을 지정할 수 있습니다.
        </div>
      )}

      <div className="vocal-list">
        {vocalists.map((v, i) => (
          <div key={v.id} className="vocal-card">
            <div className="vocal-card-header">
              <span className="vocal-num">보컬 {i + 1}</span>
              <button className="vocal-remove" onClick={() => removeVocalist(v.id)}>✕</button>
            </div>

            <div className="vocal-row">
              <div className="field-group">
                <div className="field-label">성별</div>
                <div className="tag-row">
                  {GENDERS.map(g => (
                    <button
                      key={g.value}
                      className={`tag ${v.gender === g.value ? 'tag--selected' : ''}`}
                      onClick={() => setField(v.id, 'gender', g.value)}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field-group">
                <div className="field-label">역할</div>
                <div className="tag-row">
                  {ROLES.map(r => (
                    <button
                      key={r.value}
                      className={`tag ${v.role === r.value ? 'tag--selected' : ''}`}
                      onClick={() => setField(v.id, 'role', r.value)}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="field-group">
              <div className="field-label">음색 / 기법 (복수 선택)</div>
              <div className="tag-row">
                {STYLES.map(s => (
                  <button
                    key={s.value}
                    className={`tag tag--sub ${v.styles.includes(s.value) ? 'tag--selected' : ''}`}
                    onClick={() => toggleStyle(v.id, s.value)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="vocal-preview">
              {buildVocalPrompt([v]) || '—'}
            </div>
          </div>
        ))}
      </div>

      {prompt && (
        <div className="vocal-output">
          <div className="output-header">
            <div className="field-label">보컬 프롬프트</div>
            <CopyButton text={prompt} />
          </div>
          <div className="output-area">{prompt}</div>
        </div>
      )}
    </div>
  );
}
