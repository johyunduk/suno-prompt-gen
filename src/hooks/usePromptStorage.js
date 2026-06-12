import { useState, useCallback } from 'react';
import { normalizeEntry } from '../lib/promptStorage';

const STORAGE_KEY = 'suno_saved_prompts';

function load() {
  try {
    const entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    // 구버전(문자열 prompt) 항목을 신버전 구조로 마이그레이션한다.
    return entries.map(normalizeEntry);
  } catch {
    return [];
  }
}

export function usePromptStorage() {
  const [saved, setSaved] = useState(load);

  // data: { stylePrompt, exclude, instrumental, advanced }
  const save = useCallback((name, data) => {
    const now = Date.now();
    const entry = { id: now, name: name || `Prompt #${now}`, data, createdAt: new Date(now).toISOString() };
    setSaved(prev => {
      const next = [entry, ...prev].slice(0, 50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    return entry;
  }, []);

  const remove = useCallback((id) => {
    setSaved(prev => {
      const next = prev.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSaved([]);
  }, []);

  return { saved, save, remove, clear };
}
