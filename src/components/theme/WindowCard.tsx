type WindowCardProps = {
  children: React.ReactNode;
  label?: string;
};

export default function WindowCard({ children, label }: WindowCardProps) {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
        <div className="flex gap-2">
          <span className="w-3 h-3 rounded-full bg-[var(--dot-red)]" />
          <span className="w-3 h-3 rounded-full bg-[var(--dot-yellow)]" />
          <span className="w-3 h-3 rounded-full bg-[var(--dot-green)]" />
        </div>
        {label && (
          <span className="font-mono text-xs text-[var(--text-secondary)]">{label}</span>
        )}
      </div>
      <div className="p-5 font-mono text-sm">{children}</div>
    </div>
  );
}