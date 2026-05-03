import ThemeToggle from './common/ThemeToggle';

function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--background)] px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[var(--hero-glow)] opacity-70" />
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      <div className="relative z-10 grid w-full max-w-6xl overflow-hidden rounded-[40px] border-[6px] border-blue-600/30 bg-[var(--surface-elevated)] shadow-[0_30px_100px_rgba(37,99,235,0.25)] backdrop-blur-2xl lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden border-r border-[var(--auth-sidebar-border)] bg-[var(--auth-sidebar-bg)] p-12 lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-5">
            <div 
              className="group relative flex h-16 w-16 items-center justify-center rounded-[24px] border-2 border-blue-500/30 bg-gradient-to-br from-blue-600 to-indigo-700 text-2xl font-black text-white shadow-lg animate-breathing-blue"
            >
              <div className="absolute inset-0 rounded-[24px] bg-white opacity-10 blur-sm" />
              <span className="relative z-10 tracking-tighter">EV</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black uppercase tracking-[0.2em] text-[var(--auth-sidebar-accent)]">Vault</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--auth-sidebar-muted)]">Secure Events</p>
            </div>
          </div>

          <div className="max-w-lg">
            <p className="text-xs font-black uppercase tracking-[0.4em] text-[var(--auth-sidebar-accent)] opacity-70">Professional Audit Engine</p>
            <h1 className="mt-6 text-6xl font-black leading-[1.1] tracking-tighter text-[var(--auth-sidebar-text)]">
              Precision <br />
              <span className="text-[var(--auth-sidebar-accent)]">Event Sourcing.</span>
            </h1>
            <p className="mt-6 text-lg font-medium text-[var(--auth-sidebar-muted)]">Secure, immutable, and real-time. Experience the next generation of event-driven architecture.</p>
          </div>
        </section>

        <section className="p-10 sm:p-12 lg:p-16">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-10 flex items-center gap-4 lg:hidden">
              <div 
                className="group relative flex h-14 w-14 items-center justify-center rounded-[22px] border-2 border-blue-500/30 bg-gradient-to-br from-blue-600 to-indigo-700 text-xl font-black text-white shadow-lg animate-breathing-blue"
              >
                <span className="relative z-10 tracking-tighter">EV</span>
              </div>
              <h1 className="text-lg font-black uppercase tracking-[0.2em] text-blue-500">Vault</h1>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent-strong)]">Secure Access</p>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-[var(--text-primary)]">{title}</h2>
            <p className="mt-3 text-sm font-medium leading-relaxed text-[var(--text-secondary)]">{subtitle}</p>
            <div className="mt-10">{children}</div>
            <div className="mt-8 pt-6 border-t border-[var(--border)]">{footer}</div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AuthShell;
