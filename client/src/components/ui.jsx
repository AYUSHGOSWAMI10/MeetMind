import { AlertCircle, CheckCircle2, Info, Loader2 } from "lucide-react";

export function BrandMark({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
      <rect width="32" height="32" rx="7" fill="var(--color-cobalt)" />
      <path d="M8 23V9.5l8 8 8-8V23" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="9.5" r="2.4" fill="#e08a4f" />
    </svg>
  );
}

const VARIANTS = {
  primary: "bg-cobalt text-white hover:bg-cobalt-dark disabled:bg-cobalt/55",
  secondary: "border border-line-strong bg-card text-ink hover:border-ink disabled:opacity-55",
  ghost: "text-ink-2 hover:bg-paper-2 hover:text-ink disabled:opacity-55",
  danger: "border border-danger/40 bg-card text-danger hover:bg-danger hover:text-white disabled:opacity-55",
};

export function Button({ variant = "secondary", loading = false, icon: Icon, children, className = "", disabled, ...props }) {
  return (
    <button
      type="button"
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
    >
      {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : Icon ? <Icon size={16} aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

export function Field({ label, id, error, hint, className = "", trailing, ...input }) {
  const describedBy = [error && `${id}-error`, hint && !error && `${id}-hint`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...input}
          className={`block w-full rounded-md border bg-card px-3 py-2.5 text-sm text-ink placeholder:text-mute/70 ${trailing ? "pr-11" : ""} ${error ? "border-danger" : "border-line-strong hover:border-ink-2"}`}
        />
        {trailing}
      </div>
      {error && <p id={`${id}-error`} className="mt-1.5 text-xs text-danger">{error}</p>}
      {hint && !error && <p id={`${id}-hint`} className="mt-1.5 text-xs text-mute">{hint}</p>}
    </div>
  );
}

const ALERTS = {
  error: ["border-danger/30 bg-danger-tint text-danger", AlertCircle],
  success: ["border-ok/30 bg-ok-tint text-ok", CheckCircle2],
  info: ["border-cobalt/25 bg-cobalt-tint text-cobalt-dark", Info],
  warn: ["border-ember/30 bg-ember-tint text-ember", AlertCircle],
};

export function Alert({ type = "info", children, className = "" }) {
  const [tone, Icon] = ALERTS[type];
  return (
    <div role={type === "error" ? "alert" : "status"} className={`flex items-start gap-2.5 rounded-md border px-3.5 py-3 text-sm ${tone} ${className}`}>
      <Icon size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 break-words">{children}</div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
      <div className="max-w-2xl">
        {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ember">{eyebrow}</p>}
        <h1 className="mm-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">{title}</h1>
        {description && <p className="mt-2.5 text-[15px] leading-relaxed text-ink-2">{description}</p>}
      </div>
      {actions}
    </header>
  );
}

export function SectionLabel({ children, count }) {
  return (
    <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-mute">
      {children}
      {count !== undefined && <span className="rounded-full bg-paper-2 px-2 py-0.5 text-[11px] tracking-normal text-ink-2">{count}</span>}
    </h2>
  );
}

export function Panel({ children, className = "", as: Tag = "section", ...props }) {
  return <Tag {...props} className={`rounded-lg border border-line bg-card ${className}`}>{children}</Tag>;
}
