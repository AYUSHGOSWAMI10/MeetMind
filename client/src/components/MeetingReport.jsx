import { useState } from "react";
import { CalendarPlus, ChevronDown, Mail, PencilLine } from "lucide-react";
import { formatDateTime, isUnspecified } from "../lib/format";
import { scheduleCalendarEvent, sendRecapEmail } from "../lib/api";
import { Alert, Button, Field, Panel, SectionLabel } from "./ui";

function Unspecified({ children = "Not specified" }) {
  return <span className="text-mute italic">{children}</span>;
}

function FollowThrough({ meeting, integrations }) {
  const [recipient, setRecipient] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);
  const [calBusy, setCalBusy] = useState(false);
  const [emailNote, setEmailNote] = useState(null);
  const [calNote, setCalNote] = useState(null);

  async function sendRecap() {
    if (!meeting.id) return;
    setEmailBusy(true);
    setEmailNote(null);
    try {
      const data = await sendRecapEmail(meeting.id, recipient);
      setEmailNote({ type: "success", text: `Recap sent to ${data.to}.` });
    } catch (err) {
      setEmailNote({ type: "error", text: err.message });
    } finally {
      setEmailBusy(false);
    }
  }

  async function schedule() {
    if (!meeting.id) return;
    if (!start || !end) return setCalNote({ type: "error", text: "Select both the follow-up start and end date/time first." });
    if (end <= start) return setCalNote({ type: "error", text: "The end date/time must be later than the start." });
    setCalBusy(true);
    setCalNote(null);
    try {
      const data = await scheduleCalendarEvent(meeting.id, start, end);
      setCalNote({ type: "success", text: "Follow-up added to Google Calendar.", link: data.htmlLink });
      if (data.htmlLink) window.open(data.htmlLink, "_blank", "noopener,noreferrer");
    } catch (err) {
      setCalNote({ type: "error", text: err.message });
    } finally {
      setCalBusy(false);
    }
  }

  const note = (n) => n && (
    <Alert type={n.type} className="mt-4">
      {n.text}
      {n.link && <> <a href={n.link} target="_blank" rel="noopener noreferrer" className="font-semibold underline">Open event</a></>}
    </Alert>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel as="div" className="p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink"><Mail size={16} className="text-cobalt" aria-hidden="true" /> Email the recap</h3>
        <p className="mb-4 mt-1 text-xs leading-relaxed text-mute">Sends this report through Gmail via your backend.</p>
        {integrations.email === false && <Alert type="warn" className="mb-4">The backend reports Gmail is not configured, so sending will likely fail.</Alert>}
        <Field id="recap-to" label="Recipient email" type="email" placeholder="name@example.com" value={recipient} onChange={(e) => setRecipient(e.target.value)} autoComplete="email" />
        <Button variant="primary" icon={Mail} loading={emailBusy} disabled={!meeting.id} onClick={sendRecap} className="mt-4">{emailBusy ? "Sending…" : "Send recap"}</Button>
        {note(emailNote)}
      </Panel>

      <Panel as="div" className="p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink"><CalendarPlus size={16} className="text-cobalt" aria-hidden="true" /> Schedule the follow-up</h3>
        <p className="mb-4 mt-1 text-xs leading-relaxed text-mute">Creates an event on Google Calendar via your backend.</p>
        {integrations.calendar === false && <Alert type="warn" className="mb-4">The backend reports Google Calendar is not configured, so scheduling will likely fail.</Alert>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="cal-start" label="Starts" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
          <Field id="cal-end" label="Ends" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
        <Button variant="secondary" icon={CalendarPlus} loading={calBusy} disabled={!meeting.id} onClick={schedule} className="mt-4">{calBusy ? "Scheduling…" : "Schedule calendar event"}</Button>
        {note(calNote)}
      </Panel>
    </div>
  );
}

export default function MeetingReport({ meeting, integrations, onEditTranscript }) {
  const actions = meeting.actionItems || [];
  const decisions = meeting.decisions || [];
  const when = formatDateTime(meeting.createdAt);

  return (
    <article aria-labelledby="report-title">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
        <div className="max-w-3xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ember">Meeting report{when ? ` · ${when}` : ""}</p>
          <h1 id="report-title" className="mm-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">{meeting.title}</h1>
        </div>
        <Button icon={PencilLine} onClick={onEditTranscript}>View in transcript editor</Button>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section aria-labelledby="summary-h">
          <SectionLabel><span id="summary-h">Summary</span></SectionLabel>
          <p className="mm-display mt-3 text-[19px] leading-[1.65] text-ink">{meeting.summary || <Unspecified>No summary provided.</Unspecified>}</p>
        </section>

        <section aria-labelledby="decisions-h">
          <SectionLabel count={decisions.length}><span id="decisions-h">Key decisions</span></SectionLabel>
          {decisions.length ? (
            <ol className="mt-3 divide-y divide-line border-y border-line">
              {decisions.map((d, i) => (
                <li key={i} className="flex gap-3.5 py-3 text-[15px] leading-relaxed text-ink">
                  <span aria-hidden="true" className="mm-display w-5 shrink-0 text-right text-base font-semibold text-ember">{i + 1}</span>
                  <span>{d}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-sm text-mute">No decisions identified.</p>
          )}
        </section>
      </div>

      <section aria-labelledby="actions-h" className="mt-10">
        <SectionLabel count={actions.length}><span id="actions-h">Action items</span></SectionLabel>
        {actions.length ? (
          <Panel as="div" className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <caption className="sr-only">Action items with owners and deadlines</caption>
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wider text-mute">
                  <th scope="col" className="px-5 py-3 font-semibold">Task</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Owner</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {actions.map((item, i) => (
                  <tr key={i} className="align-top">
                    <td className="px-5 py-3.5 text-[15px] leading-relaxed text-ink">{item.task}</td>
                    <td className="whitespace-nowrap px-5 py-3.5">{isUnspecified(item.owner) ? <Unspecified /> : <span className="rounded bg-cobalt-tint px-2 py-0.5 font-medium text-cobalt-dark">{item.owner}</span>}</td>
                    <td className="whitespace-nowrap px-5 py-3.5">{isUnspecified(item.deadline) ? <Unspecified /> : <span className="font-medium text-ember">{item.deadline}</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        ) : (
          <p className="mt-3 text-sm text-mute">No action items identified.</p>
        )}
      </section>

      <section aria-labelledby="followup-h" className="mt-10">
        <SectionLabel><span id="followup-h">Follow-up</span></SectionLabel>
        <p className="mt-3 border-l-2 border-ember pl-4 text-[15px] leading-relaxed text-ink">
          {isUnspecified(meeting.followUp) ? <Unspecified>No follow-up meeting specified.</Unspecified> : meeting.followUp}
        </p>
      </section>

      <section aria-labelledby="share-h" className="mt-10">
        <SectionLabel><span id="share-h">Send & schedule</span></SectionLabel>
        <div className="mt-3"><FollowThrough key={meeting.id} meeting={meeting} integrations={integrations} /></div>
      </section>

      {meeting.transcript && (
        <details className="group mt-10 rounded-lg border border-line bg-card">
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3.5 text-sm font-semibold text-ink">
            Source transcript
            <ChevronDown size={17} className="text-mute transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap border-t border-line px-5 py-4 font-sans text-sm leading-relaxed text-ink-2">{meeting.transcript}</pre>
        </details>
      )}
    </article>
  );
}
