function StatusCard({ title, subtitle }) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-6 py-8 text-center shadow-[var(--shadow-soft)]">
      <p className="text-base font-semibold text-[var(--text-primary)]">{title}</p>
      {subtitle && <p className="mt-2 text-sm text-[var(--text-secondary)]">{subtitle}</p>}
    </div>
  );
}

export default StatusCard;
