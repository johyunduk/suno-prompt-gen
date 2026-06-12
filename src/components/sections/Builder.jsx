import { useState, useCallback } from 'react';
import { payloadAfterLoad } from '../../lib/promptStorage';
import { usePromptStorage } from '../../hooks/usePromptStorage';
import { useGemini } from '../../hooks/useGemini';
import { useStyleRefine } from '../../hooks/useStyleRefine';
import { useStyleBuilder } from '../../hooks/useStyleBuilder';
import { useLyricsForm } from '../../hooks/useLyricsForm';
import StylePromptBuilder from '../builder/StylePromptBuilder';
import SavedPrompts from '../builder/SavedPrompts';
import LyricsGenerator from '../builder/LyricsGenerator';

export default function Builder() {
  const style = useStyleBuilder();
  const lyrics = useLyricsForm(style.presetStructure);
  const storage = usePromptStorage();
  const { generate, loading, error } = useGemini();
  const { refine, loading: refining, error: refineError } = useStyleRefine();

  // refined.source가 현재 정제 payload와 일치할 때만 정제 결과를 유효한 것으로 본다.
  // (태그가 바뀌면 자동으로 무효화되므로 effect로 비울 필요가 없다.)
  // 공유 URL에 권장 설정(vg/wd/si)이 있으면 정제 결과로 즉시 복원한다.
  const [refined, setRefined] = useState(() => {
    const s = style.shared;
    if (!s?.advanced || !s.text) return { source: '', data: null };
    return {
      source: JSON.stringify(payloadAfterLoad({ stylePrompt: s.text, exclude: s.exclude, instrumental: s.instrumental })),
      data: { stylePrompt: s.text, exclude: s.exclude, ...s.advanced },
    };
  });
  const [generatedLyrics, setGeneratedLyrics] = useState('');

  // payload 전체를 키로 사용해 태그/직접입력/제외/인스트루멘탈 어떤 변화든 캐시를 무효화한다.
  const refineKey = JSON.stringify(style.refinePayload);
  const refinedData = refined.source === refineKey ? refined.data : null;
  // 정제된 결과가 있으면 그것을, 없으면 원본 태그 조합을 사용한다.
  const effectiveStyle = refinedData?.stylePrompt || style.prompt;
  const effectiveExclude = refinedData?.exclude || style.excludePrompt;

  const handleRefine = useCallback(async () => {
    if (!style.canRefine) return;
    const result = await refine(style.refinePayload);
    if (result) setRefined({ source: refineKey, data: result });
  }, [refine, style.refinePayload, style.canRefine, refineKey]);

  // 저장 항목 불러오기 — 빌더 상태를 교체하고, 저장된 권장 설정이 있으면 정제 결과까지 복원한다.
  const handleLoadSaved = useCallback((data) => {
    style.loadPrompt(data);
    if (data?.advanced) {
      setRefined({
        source: JSON.stringify(payloadAfterLoad(data)),
        data: { stylePrompt: data.stylePrompt, exclude: data.exclude || '', ...data.advanced },
      });
    } else {
      setRefined({ source: '', data: null });
    }
  }, [style.loadPrompt]);

  const handleGenerateLyrics = useCallback(async () => {
    if (style.isInstrumental) return;
    setGeneratedLyrics('');
    const result = await generate(lyrics.buildPrompt(effectiveStyle, style.styleHints));
    if (result) setGeneratedLyrics(result);
  }, [generate, lyrics, effectiveStyle, style.styleHints, style.isInstrumental]);

  return (
    <div className="section-content">
      <div className="section-label">Chapter 02</div>
      <h2 className="section-title">프롬프트 빌더</h2>

      <StylePromptBuilder
        style={style}
        storage={storage}
        refinedData={refinedData}
        refining={refining}
        refineError={refineError}
        onRefine={handleRefine}
        effectiveStyle={effectiveStyle}
        effectiveExclude={effectiveExclude}
        onGenerateLyrics={handleGenerateLyrics}
        lyricsLoading={loading}
      />

      <SavedPrompts saved={storage.saved} onRemove={storage.remove} onLoad={handleLoadSaved} />

      <div className="divider" />

      <LyricsGenerator
        form={lyrics}
        stylePrompt={effectiveStyle}
        excludePrompt={effectiveExclude}
        styleHints={style.styleHints}
        instrumental={style.isInstrumental}
        onGenerate={handleGenerateLyrics}
        loading={loading}
        error={error}
        generatedLyrics={generatedLyrics}
      />
    </div>
  );
}
