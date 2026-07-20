export default function CodeKV({ k, v }: { k: string; v: string | string[] }) {
  const rendered = Array.isArray(v)
    ? `[${v.map((s) => `'${s}'`).join(', ')}]`
    : `"${v}"`;
  return (
    <div>
      <span style={{ color: 'var(--syntax-key)' }}>{k}</span>
      <span className="text-[var(--text-secondary)]">: </span>
      <span style={{ color: 'var(--syntax-string)' }}>{rendered}</span>
      <span className="text-[var(--text-secondary)]">,</span>
    </div>
  );
}