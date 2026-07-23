type CodeButtonProps = {
  children: string;
  variant?: 'primary' | 'secondary';
} & (
  | { href: string; target?: string; rel?: string; onClick?: never }
  | { href?: never; onClick?: () => void }
);

export default function CodeButton({
  children,
  variant = 'primary',
  ...props
}: CodeButtonProps) {
  const base =
    'group relative inline-flex items-center gap-0.5 font-mono text-sm px-5 py-2.5 rounded-md transition-all duration-200';

  const styles =
    variant === 'primary'
      ? 'bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] border border-[var(--accent-blue)]/40 hover:bg-[var(--accent-blue)]/15 hover:border-[var(--accent-blue)] hover:shadow-[0_0_16px_-2px_var(--accent-blue)]'
      : 'text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:text-[var(--accent-blue)] hover:border-[var(--accent-blue)]/50 hover:shadow-[0_0_12px_-4px_var(--accent-blue)]';

  const content = (
    <>
      <span className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
        [
      </span>
      <span>&gt;_{children}</span>
      <span
        className="ml-0.5 inline-block w-[7px] h-[13px] bg-current"
        style={{ animation: 'cursor-blink 1s step-end infinite' }}
      />
      <span className="opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
        ]
      </span>
    </>
  );

  if ('href' in props && props.href) {
    return (
      <a href={props.href} target={props.target} rel={props.rel} className={`${base} ${styles}`}>
        {content}
      </a>
    );
  }

  return (
    <button onClick={props.onClick} className={`${base} ${styles}`}>
      {content}
    </button>
  );
}