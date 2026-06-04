import { useState, useCallback } from 'react';
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

  // refined.source가 현재 태그 조합과 일치할 때만 정제 결과를 유효한 것으로 본다.
  // (태그가 바뀌면 자동으로 무효화되므로 effect로 비울 필요가 없다.)
  const [refined, setRefined] = useState({ source: '', text: '' });
  const [generatedLyrics, setGeneratedLyrics] = useState('');

  const refinedPrompt = refined.source === style.prompt ? refined.text : '';
  // 정제된 프롬프트가 있으면 그것을, 없으면 원본 태그 조합을 사용한다.
  const effectiveStyle = refinedPrompt || style.prompt;

  const handleRefine = useCallback(async () => {
    if (!style.prompt) return;
    const result = await refine(style.prompt);
    if (result) setRefined({ source: style.prompt, text: result });
  }, [refine, style.prompt]);

  const handleGenerateLyrics = useCallback(async () => {
    setGeneratedLyrics('');
    const result = await generate(lyrics.buildPrompt(effectiveStyle, style.styleHints));
    if (result) setGeneratedLyrics(result);
  }, [generate, lyrics, effectiveStyle, style.styleHints]);

  return (
    <div className="section-content">
      <div className="section-label">Chapter 02</div>
      <h2 className="section-title">프롬프트 빌더</h2>

      <StylePromptBuilder
        style={style}
        storage={storage}
        refinedPrompt={refinedPrompt}
        refining={refining}
        refineError={refineError}
        onRefine={handleRefine}
        effectiveStyle={effectiveStyle}
        onGenerateLyrics={handleGenerateLyrics}
        lyricsLoading={loading}
      />

      <SavedPrompts saved={storage.saved} onRemove={storage.remove} onLoad={style.setCustom} />

      <div className="divider" />

      <LyricsGenerator
        form={lyrics}
        stylePrompt={effectiveStyle}
        styleHints={style.styleHints}
        onGenerate={handleGenerateLyrics}
        loading={loading}
        error={error}
        generatedLyrics={generatedLyrics}
      />
    </div>
  );
}
