import { useState } from 'react';

export default function CopyButton({ text, label = 'Copy', className = '', disabled = false }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      disabled={disabled}
      className={`copy-btn ${copied ? 'copy-btn--copied' : ''} ${className}`}
    >
      {copied ? 'Copied!' : label}
    </button>
  );
}
