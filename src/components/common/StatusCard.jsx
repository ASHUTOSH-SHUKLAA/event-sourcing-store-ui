function StatusCard({ title, subtitle }) {
  return (
    <div className="rounded-[30px] border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-6 py-8 text-center shadow-[var(--shadow-soft)]">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent-strong)]">
        ES
      </div>
      <p className="mt-4 text-lg font-semibold text-[var(--text-primary)]">{title}</p>
      {subtitle && <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{subtitle}</p>}
    </div>
  );
}

export default StatusCard;
