export default function CodeButton({
  children,
  variant = 'primary',
  onClick,
}: {
  children: string;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}) {
  const base = 'font-mono text-sm px-4 py-2 rounded-md transition-colors';
  const styles =
    variant === 'primary'
      ? 'bg-[var(--accent-blue)] text-white hover:bg-[var(--accent-blue-hover)]'
      : 'border border-[var(--border-subtle)] hover:border-[var(--accent-blue)]';
  return (
    <button onClick={onClick} className={`${base} ${styles}`}>
      &gt;_{children}
    </button>
  );
}