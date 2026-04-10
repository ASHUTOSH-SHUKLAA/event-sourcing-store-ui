function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] lg:grid-cols-[1.2fr_0.8fr]">
        {/* Left panel */}
        <section className="hidden bg-gradient-to-br from-[rgba(34,197,94,0.18)] via-[rgba(15,23,42,0.96)] to-[rgba(15,23,42,0.92)] p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[var(--surface)] shadow-sm text-lg font-bold text-[var(--green-500)]">
            ES
          </div>
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-widest text-[var(--green-500)]">Event Sound</p>
            <h1 className="max-w-md text-4xl font-bold tracking-tight text-[var(--text-primary)] leading-tight">
              Music powered by event sourcing.
            </h1>
            <p className="max-w-md text-base leading-7 text-[var(--text-secondary)]">
              Every play, like, and subscription change is a domain event — stored, streamed, and replayed in real time.
            </p>
          </div>
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-alt)] p-5 shadow-[var(--shadow-soft)]">
            <p className="text-sm font-semibold text-[var(--text-primary)]">Event-driven architecture</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Append-only event log · State derived from replay · Zero direct mutations
            </p>
          </div>
        </section>

        {/* Right panel */}
        <section className="p-8 sm:p-10">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--green-500)] text-black font-bold text-base shadow-[var(--shadow-soft)] lg:hidden">
              ES
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)]">Authentication</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text-primary)]">{title}</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{subtitle}</p>
            <div className="mt-8">{children}</div>
            <div className="mt-6 text-sm text-[var(--text-secondary)]">{footer}</div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AuthShell;
