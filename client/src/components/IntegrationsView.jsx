import { CalendarDays, Mail, RefreshCw, Sparkles } from "lucide-react";
import { Alert, Button, PageHeader, Panel } from "./ui";

const SERVICES = [
  { key: "ai", name: "Gemini AI", icon: Sparkles, role: "Reads each transcript and extracts the summary, decisions, action items and follow-up.", missing: "Add GEMINI_API_KEY to the backend environment." },
  { key: "email", name: "Gmail", icon: Mail, role: "Sends the meeting recap to a recipient you choose.", missing: "Google OAuth credentials are not set in the backend environment." },
  { key: "calendar", name: "Google Calendar", icon: CalendarDays, role: "Creates the follow-up event with the start and end you pick.", missing: "Google OAuth credentials are not set in the backend environment." },
];

function Status({ state, configured }) {
  if (state === "loading") return <span className="inline-flex items-center gap-2 text-sm text-mute"><span className="h-2 w-2 rounded-full bg-line-strong" aria-hidden="true" />Checking…</span>;
  if (state === "error") return <span className="inline-flex items-center gap-2 text-sm text-mute"><span className="h-2 w-2 rounded-full bg-line-strong" aria-hidden="true" />Status unavailable</span>;
  return configured
    ? <span className="inline-flex items-center gap-2 text-sm font-medium text-ok"><span className="h-2 w-2 rounded-full bg-ok" aria-hidden="true" />Configured</span>
    : <span className="inline-flex items-center gap-2 text-sm font-medium text-ember"><span className="h-2 w-2 rounded-full bg-ember" aria-hidden="true" />Not configured</span>;
}

export default function IntegrationsView({ integrations, onRefresh }) {
  const { status, data, error } = integrations;
  return (
    <div>
      <PageHeader
        eyebrow="Integrations"
        title="Connected services"
        description="Live status reported by your backend. A service shows as configured only when the server says so."
        actions={<Button icon={RefreshCw} loading={status === "loading"} onClick={onRefresh}>Refresh status</Button>}
      />
      {status === "error" && <Alert type="error" className="mb-6">{error}</Alert>}
      <Panel as="ul" className="divide-y divide-line">
        {SERVICES.map(({ key, name, icon: Icon, role, missing }) => {
          const configured = status === "ready" && Boolean(data[key]);
          return (
            <li key={key} className="flex flex-wrap items-start gap-x-5 gap-y-3 p-5 sm:p-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-paper-2 text-ink-2"><Icon size={19} aria-hidden="true" /></span>
              <div className="min-w-0 flex-1 basis-64">
                <h2 className="mm-display text-lg font-semibold text-ink">{name}</h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-2">{role}</p>
                {status === "ready" && !configured && <p className="mt-2 text-xs text-mute">{missing}</p>}
              </div>
              <Status state={status} configured={configured} />
            </li>
          );
        })}
      </Panel>
    </div>
  );
}
