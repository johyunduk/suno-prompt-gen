export default function Tag({ label, selected, onClick, size = 'sm' }) {
  return (
    <button
      onClick={onClick}
      className={`tag ${selected ? 'tag--selected' : ''} tag--${size}`}
    >
      {label}
    </button>
  );
}
