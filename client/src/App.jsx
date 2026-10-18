
import { useState } from "react";
import {
  BrainCircuit, FileText, Sparkles, CheckCircle2,
  ListTodo, CalendarDays, Mail, Loader2,
  AlertCircle, ArrowRight, Upload
} from "lucide-react";

const API = "http://localhost:5001";

export default function App() {
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze() {
    if (!transcript.trim()) {
      setError("Please enter a meeting transcript.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.details || json.error);
      }

      setResult(json.data);
    } catch (err) {
      setError(err.message || "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  async function uploadFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!/\.(txt|md)$/i.test(file.name)) {
      setError("Upload a .txt or .md transcript.");
      return;
    }

    setTranscript(await file.text());
    setResult(null);
    setError("");
    e.target.value = "";
  }

  return (
    <div className="min-h-screen bg-[#080d19] text-slate-200">
      <header className="border-b border-white/10 bg-[#0c1425]">
        <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-600 p-3">
              <BrainCircuit className="text-white" size={25} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                MeetMind
              </h1>
              <p className="text-xs text-slate-400">
                AI Meeting Intelligence Agent
              </p>
            </div>
          </div>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-400">
            ● AI Powered
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-2 text-indigo-400">
            <Sparkles size={17} />
            <span className="text-sm font-semibold">
              INTELLIGENT MEETING AUTOMATION
            </span>
          </div>
          <h2 className="text-4xl font-bold text-white">
            Turn conversations into action.
          </h2>
          <p className="mt-3 text-slate-400">
            Analyze meeting transcripts, extract decisions,
            assign responsibilities and organize follow-ups.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#111b2e] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                <FileText size={21} className="text-indigo-400" />
                Meeting Transcript
              </h3>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300">
                <Upload size={16} />
                Upload File
                <input
                  type="file"
                  accept=".txt,.md"
                  onChange={uploadFile}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste your meeting transcript here..."
              className="h-72 w-full resize-none rounded-xl border border-white/10 bg-[#080d19] p-5 text-sm leading-7 text-slate-200 outline-none focus:border-indigo-500"
            />

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {transcript.length.toLocaleString()} characters
              </span>
              <button
                onClick={analyze}
                disabled={loading || !transcript.trim()}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Sparkles size={18} />
                )}
                {loading ? "Analyzing..." : "Analyze Meeting"}
              </button>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                <AlertCircle size={18} />
                {error}
              </div>
            )}
          </section>

          <aside className="rounded-2xl border border-white/10 bg-[#111b2e] p-6">
            <h3 className="mb-6 text-lg font-semibold text-white">
              AI Processing Pipeline
            </h3>
            {[
              ["1", "Transcript Input", "Upload or paste meeting notes"],
              ["2", "Gemini Analysis", "Understand meeting context"],
              ["3", "Decision Extraction", "Identify key decisions"],
              ["4", "Action Tracking", "Extract owners and deadlines"],
              ["5", "Automation", "Email and Calendar integration"]
            ].map(([n, title, desc], i) => (
              <div key={n} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-sm font-bold text-indigo-400">
                    {n}
                  </div>
                  {i < 4 && (
                    <div className="my-2 h-8 w-px bg-white/10" />
                  )}
                </div>
                <div className="pb-5">
                  <p className="font-medium text-white">{title}</p>
                  <p className="mt-1 text-xs text-slate-400">{desc}</p>
                </div>
              </div>
            ))}
          </aside>
        </div>

        {result && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="mb-1 text-sm text-emerald-400">
                  <CheckCircle2 size={15} className="mr-2 inline" />
                  Analysis completed
                </p>
                <h2 className="text-2xl font-bold text-white">
                  {result.title}
                </h2>
              </div>
              <span className="rounded-lg bg-indigo-500/10 px-4 py-2 text-sm text-indigo-300">
                Gemini AI Analysis
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-[#111b2e] p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                  <FileText className="text-indigo-400" size={20} />
                  Meeting Summary
                </h3>
                <p className="text-sm leading-7 text-slate-300">
                  {result.summary}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#111b2e] p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                  <CheckCircle2 className="text-emerald-400" size={20} />
                  Key Decisions
                </h3>
                <div className="space-y-3">
                  {result.decisions?.length ? (
                    result.decisions.map((decision, i) => (
                      <div key={i} className="flex gap-3 text-sm text-slate-300">
                        <CheckCircle2
                          size={17}
                          className="mt-0.5 shrink-0 text-emerald-400"
                        />
                        {decision}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">
                      No decisions identified.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111b2e]">
              <div className="flex items-center gap-2 border-b border-white/10 p-6">
                <ListTodo size={21} className="text-indigo-400" />
                <h3 className="text-lg font-semibold text-white">
                  Action Items
                </h3>
                <span className="ml-auto rounded-full bg-indigo-500/15 px-3 py-1 text-xs text-indigo-300">
                  {result.actionItems?.length || 0} Tasks
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Task</th>
                      <th className="px-6 py-4">Owner</th>
                      <th className="px-6 py-4">Deadline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.actionItems?.map((item, i) => (
                      <tr key={i} className="border-t border-white/5">
                        <td className="px-6 py-4 text-white">{item.task}</td>
                        <td className="px-6 py-4">
                          <span className="rounded-lg bg-indigo-500/10 px-3 py-1 text-indigo-300">
                            {item.owner}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                          {item.deadline}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#111b2e] p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <CalendarDays className="text-indigo-400" size={20} />
                Follow-up Meeting
              </h3>
              <p className="text-slate-300">
                {result.followUp || "No follow-up meeting specified."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                disabled
                title="Available after email integration"
                className="flex cursor-not-allowed items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white opacity-50"
              >
                <Mail size={18} />
                Send Email Recap
              </button>
              <button
                disabled
                title="Available after Calendar integration"
                className="flex cursor-not-allowed items-center gap-2 rounded-xl border border-white/20 px-5 py-3 font-medium text-white opacity-50"
              >
                <CalendarDays size={18} />
                Schedule Follow-up
                <ArrowRight size={16} />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Email and Calendar automation will be enabled in the next steps.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
