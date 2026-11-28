import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { formatDate, isUnspecified } from "../lib/format";
import { ScopeToggle } from "./HistoryView";
import { Alert, Button, PageHeader, Panel } from "./ui";

export default function ActionItemsView({ meetings, allCount, mineCount, scope, onScope, loading, error, onOpen, onNewMeeting }) {
  const [query, setQuery] = useState("");

  const rows = useMemo(
    () => meetings.flatMap((m) => (m.actionItems || []).map((item, i) => ({ ...item, key: `${m.id}-${i}`, meetingId: m.id, meetingTitle: m.title, createdAt: m.createdAt }))),
    [meetings],
  );
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? rows.filter((r) => `${r.task} ${r.owner} ${r.deadline} ${r.meetingTitle}`.toLowerCase().includes(q)) : rows;
  }, [rows, query]);

  return (
    <div>
      <PageHeader
        eyebrow="Action items"
        title="Everything that was committed to"
        description="Tasks, owners and deadlines exactly as extracted from your saved meetings. Nothing is added or inferred here."
      />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <label htmlFor="actions-search" className="sr-only">Search action items</label>
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute" aria-hidden="true" />
          <input id="actions-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search task, owner, deadline or meeting"
            className="block w-full rounded-md border border-line-strong bg-card py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-mute/70 hover:border-ink-2" />
        </div>
        <ScopeToggle scope={scope} onChange={onScope} mineCount={mineCount} allCount={allCount} />
      </div>

      {error && <Alert type="error" className="mb-6">{error}</Alert>}
      {loading && !meetings.length && <div role="status" className="mm-skeleton h-40 rounded-lg"><span className="sr-only">Loading action items</span></div>}

      {!loading && !error && rows.length === 0 && (
        <Panel className="px-6 py-14 text-center">
          <h2 className="mm-display text-xl font-semibold text-ink">No action items yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-2">Action items appear once a meeting has been analyzed{scope === "mine" && allCount > 0 ? ", or switch to all meetings on this server" : ""}.</p>
          <Button variant="primary" onClick={onNewMeeting} className="mt-5">Analyze a transcript</Button>
        </Panel>
      )}
      {rows.length > 0 && visible.length === 0 && <Panel className="px-6 py-12 text-center text-sm text-ink-2">No action items match “{query.trim()}”.</Panel>}

      {visible.length > 0 && (
        <Panel as="div" className="overflow-x-auto">
          <table className="w-full min-w-[42rem] text-left text-sm">
            <caption className="sr-only">Action items across saved meetings</caption>
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wider text-mute">
                <th scope="col" className="px-5 py-3 font-semibold">Task</th>
                <th scope="col" className="px-5 py-3 font-semibold">Owner</th>
                <th scope="col" className="px-5 py-3 font-semibold">Deadline</th>
                <th scope="col" className="px-5 py-3 font-semibold">Meeting</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((r) => (
                <tr key={r.key} className="align-top">
                  <td className="px-5 py-3.5 text-[15px] leading-relaxed text-ink">{r.task}</td>
                  <td className="whitespace-nowrap px-5 py-3.5">{isUnspecified(r.owner) ? <span className="italic text-mute">Not specified</span> : <span className="rounded bg-cobalt-tint px-2 py-0.5 font-medium text-cobalt-dark">{r.owner}</span>}</td>
                  <td className="whitespace-nowrap px-5 py-3.5">{isUnspecified(r.deadline) ? <span className="italic text-mute">Not specified</span> : <span className="font-medium text-ember">{r.deadline}</span>}</td>
                  <td className="px-5 py-3.5">
                    <button type="button" onClick={() => onOpen(r.meetingId)} className="text-left text-cobalt hover:underline">{r.meetingTitle}</button>
                    <span className="block text-xs text-mute">{formatDate(r.createdAt)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </div>
  );
}
