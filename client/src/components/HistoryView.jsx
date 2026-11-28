import { useMemo, useState } from "react";
import { ArrowUpRight, RefreshCw, Search, Trash2 } from "lucide-react";
import { formatDateTime } from "../lib/format";
import { Alert, Button, PageHeader, Panel } from "./ui";

export function ScopeToggle({ scope, onChange, mineCount, allCount }) {
  const options = [["mine", `My meetings (${mineCount})`], ["all", `All on this server (${allCount})`]];
  return (
    <div role="group" aria-label="Which saved meetings to show" className="inline-flex rounded-md border border-line-strong bg-card p-0.5 text-sm">
      {options.map(([id, label]) => (
        <button
          key={id}
          type="button"
          aria-pressed={scope === id}
          onClick={() => onChange(id)}
          className={`rounded px-3 py-1.5 font-medium transition-colors ${scope === id ? "bg-ink text-paper" : "text-ink-2 hover:text-ink"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Skeleton() {
  return (
    <ul aria-hidden="true" className="space-y-3">
      {[0, 1, 2].map((i) => (
        <li key={i} className="rounded-lg border border-line bg-card p-5">
          <div className="mm-skeleton h-4 w-1/3 rounded" />
          <div className="mm-skeleton mt-3 h-3 w-1/5 rounded" />
          <div className="mm-skeleton mt-4 h-3 w-4/5 rounded" />
        </li>
      ))}
    </ul>
  );
}

export default function HistoryView({ meetings, allCount, mineCount, scope, onScope, loading, error, onRetry, onOpen, onDelete, onNewMeeting }) {
  const [query, setQuery] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return meetings;
    return meetings.filter((m) => `${m.title} ${m.summary || ""}`.toLowerCase().includes(q));
  }, [meetings, query]);

  async function confirmDelete(id) {
    setBusyId(id);
    await onDelete(id);
    setBusyId(null);
    setConfirmId(null);
  }

  const showEmpty = !loading && !error && meetings.length === 0;
  const showNoMatch = !loading && !error && meetings.length > 0 && visible.length === 0;

  return (
    <div>
      <PageHeader
        eyebrow="Meetings"
        title="Meeting history"
        description="Every analysis saved by your backend, newest first. Open one to see the full report."
        actions={<Button variant="primary" onClick={onNewMeeting}>New meeting</Button>}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <label htmlFor="history-search" className="sr-only">Search meetings</label>
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute" aria-hidden="true" />
          <input
            id="history-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or summary"
            className="block w-full rounded-md border border-line-strong bg-card py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-mute/70 hover:border-ink-2"
          />
        </div>
        <ScopeToggle scope={scope} onChange={onScope} mineCount={mineCount} allCount={allCount} />
      </div>
      {scope === "mine" && (
        <p className="mb-6 text-xs leading-relaxed text-mute">“My meetings” are the ones analyzed while signed in to this account, tracked in this browser only. The backend does not separate meetings by user.</p>
      )}

      {error && (
        <Alert type="error" className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{error}</span>
            <Button variant="secondary" icon={RefreshCw} onClick={onRetry} className="px-3 py-1.5">Retry</Button>
          </div>
        </Alert>
      )}

      {loading && !meetings.length && <div role="status" aria-label="Loading meetings"><Skeleton /></div>}

      {showEmpty && (
        <Panel className="px-6 py-14 text-center">
          <h2 className="mm-display text-xl font-semibold text-ink">{scope === "mine" && allCount > 0 ? "No meetings under this account yet" : "No saved meetings yet"}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-2">
            {scope === "mine" && allCount > 0
              ? `The server holds ${allCount} saved meeting${allCount === 1 ? "" : "s"} that weren’t analyzed from this account.`
              : "Analyzed meetings are saved automatically and will be listed here."}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Button variant="primary" onClick={onNewMeeting}>Analyze a transcript</Button>
            {scope === "mine" && allCount > 0 && <Button onClick={() => onScope("all")}>Show all on this server</Button>}
          </div>
        </Panel>
      )}

      {showNoMatch && <Panel className="px-6 py-12 text-center text-sm text-ink-2">No meetings match “{query.trim()}”.</Panel>}

      {visible.length > 0 && (
        <ul className="space-y-3" aria-label="Saved meetings">
          {visible.map((m) => {
            const confirming = confirmId === m.id;
            const busy = busyId === m.id;
            return (
              <li key={m.id}>
                <Panel as="div" className="p-5 transition-colors hover:border-line-strong">
                  <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
                    <div className="min-w-0 flex-1 basis-80">
                      <h2 className="mm-display text-lg font-semibold leading-snug text-ink">{m.title}</h2>
                      <p className="mt-1 text-xs text-mute"><time dateTime={m.createdAt}>{formatDateTime(m.createdAt)}</time></p>
                      {m.summary && <p className="mm-clamp-2 mt-3 text-sm leading-relaxed text-ink-2">{m.summary}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {confirming ? (
                        <>
                          <span className="text-sm text-ink-2">Delete permanently?</span>
                          <Button variant="danger" loading={busy} onClick={() => confirmDelete(m.id)} className="px-3 py-2">{busy ? "Deleting…" : "Delete"}</Button>
                          <Button variant="ghost" disabled={busy} onClick={() => setConfirmId(null)} className="px-3 py-2">Cancel</Button>
                        </>
                      ) : (
                        <>
                          <Button icon={ArrowUpRight} onClick={() => onOpen(m.id)} aria-label={`Open ${m.title}`} className="px-3 py-2">Open</Button>
                          <Button variant="ghost" icon={Trash2} onClick={() => setConfirmId(m.id)} aria-label={`Delete ${m.title}`} className="px-3 py-2 hover:text-danger">Delete</Button>
                        </>
                      )}
                    </div>
                  </div>
                </Panel>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
