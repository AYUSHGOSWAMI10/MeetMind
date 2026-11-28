import { FolderOpen, LayoutDashboard, ListChecks, LogOut, Plug } from "lucide-react";
import { formatDate, initials } from "../lib/format";
import { BrandMark } from "./ui";

const NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "meetings", label: "Meetings", icon: FolderOpen },
  { id: "actions", label: "Action Items", icon: ListChecks },
  { id: "integrations", label: "Integrations", icon: Plug },
];

export default function Sidebar({ view, onNavigate, user, recent, activeMeetingId, onOpenMeeting, onLogout }) {
  const activeNav = view === "report" ? "meetings" : view;
  return (
    <div className="flex h-full flex-col bg-paper-2/70">
      <div className="flex items-center gap-3 px-5 pb-4 pt-6">
        <BrandMark size={30} />
        <span className="mm-display text-xl font-semibold text-ink">MeetMind</span>
      </div>

      <nav aria-label="Primary" className="px-3">
        <ul className="space-y-0.5">
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = activeNav === id;
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onNavigate(id)}
                  aria-current={active ? "page" : undefined}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${active ? "bg-card text-cobalt shadow-[inset_2px_0_0_var(--color-cobalt)]" : "text-ink-2 hover:bg-card/70 hover:text-ink"}`}
                >
                  <Icon size={17} aria-hidden="true" />
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <section aria-labelledby="recent-heading" className="mt-7 min-h-0 flex-1 overflow-y-auto px-3">
        <h2 id="recent-heading" className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">Recent meetings</h2>
        {recent.length ? (
          <ul className="space-y-0.5">
            {recent.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => onOpenMeeting(m.id)}
                  aria-current={view === "report" && activeMeetingId === m.id ? "page" : undefined}
                  className={`block w-full rounded-md px-3 py-2 text-left transition-colors hover:bg-card/70 ${view === "report" && activeMeetingId === m.id ? "bg-card" : ""}`}
                >
                  <span className="block truncate text-sm text-ink">{m.title}</span>
                  <span className="block text-xs text-mute">{formatDate(m.createdAt)}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-3 text-xs leading-relaxed text-mute">Meetings you analyze will appear here.</p>
        )}
      </section>

      <section aria-labelledby="workspace-heading" className="border-t border-line p-3">
        <h2 id="workspace-heading" className="sr-only">Workspace</h2>
        <p className="px-3 pb-2 text-[11px] leading-relaxed text-mute">Local workspace · meetings are stored by your backend, your account only in this browser.</p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onNavigate("profile")}
            aria-current={view === "profile" ? "page" : undefined}
            className={`flex min-w-0 flex-1 items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-card/70 ${view === "profile" ? "bg-card" : ""}`}
          >
            <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-semibold text-paper">{initials(user.name)}</span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-ink">{user.name}</span>
              <span className="block truncate text-xs text-mute">{user.email}</span>
            </span>
          </button>
          <button type="button" onClick={onLogout} aria-label="Log out" title="Log out" className="rounded-md p-2.5 text-mute hover:bg-card/70 hover:text-danger">
            <LogOut size={17} aria-hidden="true" />
          </button>
        </div>
      </section>
    </div>
  );
}
