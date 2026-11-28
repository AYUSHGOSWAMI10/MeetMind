import { useRef } from "react";
import { FileText, Sparkles, Upload } from "lucide-react";
import { Alert, Button } from "./ui";

export const TRANSCRIPT_LIMIT = 50000;

export default function TranscriptWorkspace({ transcript, onChange, sourceName, onUpload, onLoadDemo, onAnalyze, loading, error }) {
  const fileRef = useRef(null);
  const length = transcript.length;
  const overLimit = length > TRANSCRIPT_LIMIT;

  return (
    <section aria-labelledby="transcript-heading" className="overflow-hidden rounded-lg border border-line-strong bg-card shadow-[0_1px_0_rgba(30,29,26,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <FileText size={18} className="shrink-0 text-cobalt" aria-hidden="true" />
          <h2 id="transcript-heading" className="mm-display text-lg font-semibold text-ink">Meeting transcript</h2>
          {sourceName && <span className="truncate rounded bg-paper-2 px-2 py-0.5 text-xs text-ink-2">{sourceName}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input ref={fileRef} id="transcript-file" type="file" accept=".txt,.md" onChange={onUpload} className="sr-only" tabIndex={-1} aria-label="Upload transcript file (.txt or .md)" />
          <Button variant="ghost" icon={Upload} onClick={() => fileRef.current?.click()} className="px-3 py-2">Upload .txt / .md</Button>
          <Button variant="ghost" onClick={onLoadDemo} className="px-3 py-2">Load demo transcript</Button>
        </div>
      </div>

      <label htmlFor="transcript-input" className="sr-only">Meeting transcript</label>
      <textarea
        id="transcript-input"
        value={transcript}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste a meeting transcript here, or upload a .txt or .md file…"
        aria-invalid={error || overLimit ? true : undefined}
        aria-describedby="transcript-count transcript-error"
        spellCheck={false}
        className="mm-editor block h-80 w-full resize-y border-0 bg-card px-6 text-[15px] text-ink placeholder:text-mute/70 focus-visible:outline-offset-[-2px] sm:h-96"
      />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-paper-2/40 px-5 py-3.5">
        <p id="transcript-count" className={`text-xs tabular-nums ${overLimit ? "font-semibold text-danger" : "text-mute"}`}>
          {length.toLocaleString()} / {TRANSCRIPT_LIMIT.toLocaleString()} characters
        </p>
        <Button variant="primary" icon={Sparkles} loading={loading} onClick={onAnalyze} className="px-6">
          {loading ? "Analyzing meeting…" : "Analyze Meeting"}
        </Button>
      </div>

      <div id="transcript-error" aria-live="polite">
        {error && <Alert type="error" className="m-4 mt-0">{error}</Alert>}
      </div>
    </section>
  );
}
