import { useState, useCallback } from 'react';

const STORAGE_KEY = 'suno_saved_prompts';

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function usePromptStorage() {
  const [saved, setSaved] = useState(load);

  const save = useCallback((name, prompt) => {
    const entry = { id: Date.now(), name: name || `Prompt #${Date.now()}`, prompt, createdAt: new Date().toISOString() };
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
