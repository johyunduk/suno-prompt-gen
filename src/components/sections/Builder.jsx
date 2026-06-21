import { useState, useCallback } from 'react';
import { payloadAfterLoad } from '../../lib/promptStorage';
import { scrollIntoViewA11y } from '../../lib/scroll';
import { usePromptStorage } from '../../hooks/usePromptStorage';
import { useGemini } from '../../hooks/useGemini';
import { useStyleRefine } from '../../hooks/useStyleRefine';
import { useStyleBuilder } from '../../hooks/useStyleBuilder';
import { useLyricsForm } from '../../hooks/useLyricsForm';
import StylePromptBuilder from '../builder/StylePromptBuilder';
import StyleResultPanel from '../builder/StyleResultPanel';
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
  // 정제 성공 시에만 증가 — 자식의 결과 스크롤이 첫 정제·재정제를 모두 감지하게 한다.
  const [refineTick, setRefineTick] = useState(0);

  // payload 전체를 키로 사용해 태그/직접입력/제외/인스트루멘탈 어떤 변화든 캐시를 무효화한다.
  const refineKey = JSON.stringify(style.refinePayload);
  const refinedData = refined.source === refineKey ? refined.data : null;
  // 정제된 결과가 있으면 그것을, 없으면 원본 태그 조합을 사용한다.
  const effectiveStyle = refinedData?.stylePrompt || style.prompt;
  const effectiveExclude = refinedData?.exclude || style.excludePrompt;

  const handleRefine = useCallback(async () => {
    if (!style.canRefine) return;
    const result = await refine(style.refinePayload);
    if (result) {
      setRefined({ source: refineKey, data: result });
      setRefineTick(t => t + 1);
    }
  }, [refine, style.refinePayload, style.canRefine, refineKey]);

  // '다음: 가사 설정' — 아래 가사 빌더 영역으로 스크롤하고 포커스도 옮긴다.
  // (스크롤만 하면 키보드 사용자의 Tab이 위쪽 컨트롤로 가므로 focus까지 이동.
  //  preventScroll로 scrollIntoViewA11y의 부드러운 스크롤과 중복되지 않게 한다.)
  const goToLyrics = useCallback(() => {
    const el = document.getElementById('lyrics-builder');
    scrollIntoViewA11y(el);
    el?.focus({ preventScroll: true });
  }, []);

  // 저장 항목 불러오기 — 빌더 상태를 교체하고, 저장된 권장 설정이 있으면 정제 결과까지 복원한다.
  // loadPrompt를 구조분해해 메서드 호출(style.loadPrompt())이 아닌 일반 함수 호출로 만든다.
  // exhaustive-deps는 메서드 호출 시 수신 객체 전체(매 렌더 새로 생기는 style)를 deps로 요구하므로,
  // 안정적인 loadPrompt(useStyleBuilder의 useCallback) 하나만 의존하도록 좁힌다.
  const { loadPrompt } = style;
  const handleLoadSaved = useCallback((data) => {
    loadPrompt(data);
    if (data?.advanced) {
      setRefined({
        source: JSON.stringify(payloadAfterLoad(data)),
        data: { stylePrompt: data.stylePrompt, exclude: data.exclude || '', ...data.advanced },
      });
    } else {
      setRefined({ source: '', data: null });
    }
  }, [loadPrompt]);

  const handleGenerateLyrics = useCallback(async () => {
    if (style.isInstrumental) return;
    setGeneratedLyrics('');
    const result = await generate(lyrics.buildPrompt(effectiveStyle, style.styleHints));
    if (result) setGeneratedLyrics(result);
  }, [generate, lyrics, effectiveStyle, style.styleHints, style.isInstrumental]);

  return (
    <div className="section-content">
      <div className="section-label">Workspace</div>
      <h2 className="section-title section-title--compact">프롬프트 빌더</h2>

      {/* 입력 영역과 결과(스티키) 패널을 컨테이너가 2단으로 조율한다.
          데스크톱에서는 결과 패널이 입력을 스크롤하는 동안 화면에 고정된다. */}
      <div className="builder-layout">
        <div className="builder-layout__inputs">
          <StylePromptBuilder style={style} />
        </div>
        <aside className="builder-layout__results">
          <StyleResultPanel
            style={style}
            storage={storage}
            refinedData={refinedData}
            refining={refining}
            refineError={refineError}
            onRefine={handleRefine}
            refineTick={refineTick}
            effectiveStyle={effectiveStyle}
            effectiveExclude={effectiveExclude}
            onGenerateLyrics={handleGenerateLyrics}
            onGoToLyrics={goToLyrics}
            lyricsLoading={loading}
          />
        </aside>
      </div>

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
