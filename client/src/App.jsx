import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import "./App.css";
import { analyzeTranscript, getIntegrations, getMeeting, listMeetings, removeMeeting } from "./lib/api";
import { addOwnedId, forgetOwnedId, getOwnedIds, getSessionUser, signOut } from "./lib/auth";
import { formatDateTime } from "./lib/format";
import ActionItemsView from "./components/ActionItemsView";
import AuthScreen from "./components/AuthScreen";
import HistoryView from "./components/HistoryView";
import IntegrationsView from "./components/IntegrationsView";
import MeetingReport from "./components/MeetingReport";
import ProfileView from "./components/ProfileView";
import Sidebar from "./components/Sidebar";
import TranscriptWorkspace, { TRANSCRIPT_LIMIT } from "./components/TranscriptWorkspace";
import { Alert, BrandMark, Button, PageHeader, Panel, SectionLabel } from "./components/ui";

const SAMPLE_TRANSCRIPT = `Product launch planning — team sync

Maya: We need to launch the new dashboard by March 20. The onboarding flow is still the main blocker.
Arjun: I will finish the onboarding screens by March 12 and share them for review.
Leah: I will prepare the launch email and help-center article by March 15.
Maya: Agreed. We will launch the dashboard on March 20 if QA signs off by March 18.
Arjun: I will also send the QA checklist by March 14.
Maya: Let's meet again next week to review progress.`;

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

function Workspace({ user, onUserChange, onLogout }) {
  const [view, setView] = useState("overview");
  const [navOpen, setNavOpen] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [meetings, setMeetings] = useState([]);
  const [meetingsLoading, setMeetingsLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [integrations, setIntegrations] = useState({ status: "loading", data: null, error: "" });
  const [ownedIds, setOwnedIds] = useState(() => getOwnedIds(user.id));
  const [scope, setScope] = useState("mine");
  const closeRef = useRef(null);

  const loadMeetings = useCallback(async () => {
    try {
      setMeetings(await listMeetings());
      setHistoryError("");
    } catch (err) {
      setHistoryError(err.message);
    } finally {
      setMeetingsLoading(false);
    }
  }, []);

  const loadIntegrations = useCallback(async () => {
    try {
      setIntegrations({ status: "ready", data: await getIntegrations(), error: "" });
    } catch (err) {
      setIntegrations({ status: "error", data: null, error: err.message });
    }
  }, []);

  // Initial state already reads "loading"; these wrappers show it again on user-triggered refreshes.
  const retryMeetings = useCallback(() => { setMeetingsLoading(true); return loadMeetings(); }, [loadMeetings]);
  const refreshIntegrations = useCallback(() => { setIntegrations((s) => ({ ...s, status: "loading" })); return loadIntegrations(); }, [loadIntegrations]);

  useEffect(() => {
    let active = true;
    listMeetings()
      .then((data) => active && (setMeetings(data), setHistoryError("")))
      .catch((err) => active && setHistoryError(err.message))
      .finally(() => active && setMeetingsLoading(false));
    getIntegrations()
      .then((data) => active && setIntegrations({ status: "ready", data, error: "" }))
      .catch((err) => active && setIntegrations({ status: "error", data: null, error: err.message }));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!navOpen) return undefined;
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && setNavOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navOpen]);

  const mine = useMemo(() => meetings.filter((m) => ownedIds.includes(m.id)), [meetings, ownedIds]);
  const scoped = scope === "mine" ? mine : meetings;

  function navigate(next) {
    setView(next);
    setNavOpen(false);
    setNotice("");
    window.scrollTo(0, 0);
  }

  async function openMeeting(id) {
    setNavOpen(false);
    try {
      const data = await getMeeting(id);
      setResult(data);
      setTranscript(data.transcript || "");
      setSourceName("");
      setError("");
      setNotice("");
      setView("report");
      window.scrollTo(0, 0);
    } catch (err) {
      setNotice(err.message);
    }
  }

  async function deleteMeeting(id) {
    try {
      await removeMeeting(id);
      forgetOwnedId(id);
      setOwnedIds(getOwnedIds(user.id));
      if (result?.id === id) {
        setResult(null);
        if (view === "report") setView("meetings");
      }
      await loadMeetings();
    } catch (err) {
      setHistoryError(err.message);
    }
  }

  async function analyze() {
    if (!transcript.trim()) return setError("Please enter a meeting transcript.");
    if (transcript.length > TRANSCRIPT_LIMIT) return setError(`Transcript is too long (${TRANSCRIPT_LIMIT.toLocaleString()} character limit).`);
    setAnalyzing(true);
    setError("");
    setResult(null);
    try {
      const data = await analyzeTranscript(transcript);
      if (data.id) {
        addOwnedId(user.id, data.id);
        setOwnedIds(getOwnedIds(user.id));
      }
      setResult(data);
      setView("report");
      window.scrollTo(0, 0);
      await loadMeetings();
    } catch (err) {
      setError(err.message || "Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function uploadFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!/\.(txt|md)$/i.test(file.name)) return setError("Upload a .txt or .md transcript.");
    try {
      const text = await file.text();
      if (!text.trim()) return setError(`${file.name} is empty.`);
      setTranscript(text);
      setSourceName(file.name);
      setResult(null);
      setError("");
    } catch {
      setError("Could not read that file. Try another one.");
    }
  }

  function loadDemo() {
    setTranscript(SAMPLE_TRANSCRIPT);
    setSourceName("Demo transcript");
    setResult(null);
    setError("");
  }

  const sidebar = (
    <Sidebar view={view} onNavigate={navigate} user={user} recent={mine.slice(0, 5)} activeMeetingId={result?.id} onOpenMeeting={openMeeting} onLogout={onLogout} />
  );
  const listProps = { meetings: scoped, allCount: meetings.length, mineCount: mine.length, scope, onScope: setScope, loading: meetingsLoading, error: historyError };

  return (
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[17.5rem_minmax(0,1fr)]">
      <a href="#main" className="sr-only z-50 rounded bg-ink px-3 py-2 text-paper focus:not-sr-only focus:fixed focus:left-3 focus:top-3">Skip to content</a>

      <aside aria-label="Sidebar" className="sticky top-0 hidden h-screen border-r border-line lg:block">{sidebar}</aside>

      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-paper/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2.5"><BrandMark size={26} /><span className="mm-display text-lg font-semibold">MeetMind</span></div>
        <button type="button" onClick={() => setNavOpen(true)} aria-label="Open navigation" aria-expanded={navOpen} className="rounded-md p-2 text-ink hover:bg-paper-2"><Menu size={22} aria-hidden="true" /></button>
      </div>

      {navOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button type="button" aria-label="Close navigation" tabIndex={-1} onClick={() => setNavOpen(false)} className="absolute inset-0 bg-ink/40" />
          <div className="relative h-full w-72 max-w-[85vw] border-r border-line bg-paper shadow-xl">
            <button ref={closeRef} type="button" onClick={() => setNavOpen(false)} aria-label="Close navigation" className="absolute right-3 top-4 z-10 rounded-md p-2 text-ink-2 hover:bg-paper-2"><X size={20} aria-hidden="true" /></button>
            {sidebar}
          </div>
        </div>
      )}

      <main id="main" className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
        {notice && <Alert type="error" className="mb-6">{notice}</Alert>}

        {view === "overview" && (
          <>
            <PageHeader
              eyebrow={`${greeting()}, ${user.name.split(" ")[0]}`}
              title="Turn a transcript into a clear record."
              description="Paste or upload a meeting transcript. MeetMind extracts the summary, decisions, owners and deadlines — only what the transcript supports."
            />
            <TranscriptWorkspace
              transcript={transcript}
              onChange={(value) => { setTranscript(value); setSourceName(""); }}
              sourceName={sourceName}
              onUpload={uploadFile}
              onLoadDemo={loadDemo}
              onAnalyze={analyze}
              loading={analyzing}
              error={error}
            />
            <section aria-labelledby="latest-h" className="mt-12">
              <div className="mb-3 flex items-center justify-between">
                <SectionLabel><span id="latest-h">Latest meetings</span></SectionLabel>
                {mine.length > 0 && <button type="button" onClick={() => navigate("meetings")} className="text-sm font-medium text-cobalt hover:underline">View all</button>}
              </div>
              {meetingsLoading && !meetings.length ? (
                <div role="status" className="mm-skeleton h-24 rounded-lg"><span className="sr-only">Loading meetings</span></div>
              ) : historyError ? (
                <Alert type="error">{historyError}</Alert>
              ) : mine.length ? (
                <Panel as="ul" className="divide-y divide-line">
                  {mine.slice(0, 3).map((m) => (
                    <li key={m.id}>
                      <button type="button" onClick={() => openMeeting(m.id)} className="flex w-full flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-5 py-4 text-left hover:bg-paper-2/50">
                        <span className="mm-display text-base font-semibold text-ink">{m.title}</span>
                        <span className="text-xs text-mute">{formatDateTime(m.createdAt)}</span>
                      </button>
                    </li>
                  ))}
                </Panel>
              ) : (
                <p className="text-sm text-mute">Meetings you analyze while signed in will appear here.</p>
              )}
            </section>
          </>
        )}

        {view === "report" && result && (
          <MeetingReport meeting={result} integrations={integrations.data || {}} onEditTranscript={() => navigate("overview")} />
        )}
        {view === "report" && !result && (
          <Panel className="px-6 py-14 text-center">
            <h1 className="mm-display text-xl font-semibold">No meeting open</h1>
            <p className="mt-2 text-sm text-ink-2">Pick a meeting from your history or analyze a new transcript.</p>
            <Button variant="primary" onClick={() => navigate("meetings")} className="mt-5">Go to meetings</Button>
          </Panel>
        )}

        {view === "meetings" && (
          <HistoryView {...listProps} onRetry={retryMeetings} onOpen={openMeeting} onDelete={deleteMeeting} onNewMeeting={() => navigate("overview")} />
        )}
        {view === "actions" && <ActionItemsView {...listProps} onOpen={openMeeting} onNewMeeting={() => navigate("overview")} />}
        {view === "integrations" && <IntegrationsView integrations={integrations} onRefresh={refreshIntegrations} />}
        {view === "profile" && <ProfileView user={user} onUserChange={onUserChange} onLogout={onLogout} meetingCount={mine.length} />}
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => getSessionUser());

  function logout() {
    signOut();
    setUser(null);
  }

  if (!user) return <AuthScreen onAuthenticated={setUser} />;
  return <Workspace key={user.id} user={user} onUserChange={setUser} onLogout={logout} />;
}
