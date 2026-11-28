import { useState } from "react";
import { Eye, EyeOff, ShieldAlert } from "lucide-react";
import { signIn, signUp, EMAIL_PATTERN, PASSWORD_MIN_LENGTH } from "../lib/auth";
import { Alert, BrandMark, Button, Field } from "./ui";

function PasswordToggle({ shown, onToggle }) {
  const Icon = shown ? EyeOff : Eye;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={shown ? "Hide password" : "Show password"}
      aria-pressed={shown}
      className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-mute hover:text-ink"
    >
      <Icon size={17} aria-hidden="true" />
    </button>
  );
}

export default function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("signin");
  const [values, setValues] = useState({ name: "", email: "", password: "", confirm: "", remember: true });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const signingUp = mode === "signup";

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  function switchMode(next) {
    setMode(next);
    setErrors({});
    setFormError("");
    setValues((v) => ({ ...v, password: "", confirm: "" }));
  }

  function validate() {
    const next = {};
    if (signingUp && values.name.trim().length < 2) next.name = "Enter your full name.";
    if (!EMAIL_PATTERN.test(values.email.trim())) next.email = "Enter a valid email address.";
    if (signingUp) {
      if (values.password.length < PASSWORD_MIN_LENGTH) next.password = `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
      else if (!/[A-Za-z]/.test(values.password) || !/\d/.test(values.password)) next.password = "Include at least one letter and one number.";
      if (values.confirm !== values.password) next.confirm = "Passwords do not match.";
    } else if (!values.password) {
      next.password = "Enter your password.";
    }
    return next;
  }

  async function submit(e) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    setFormError("");
    if (Object.keys(found).length) return;
    setLoading(true);
    try {
      const user = signingUp
        ? await signUp({ name: values.name, email: values.email, password: values.password })
        : await signIn({ email: values.email, password: values.password, remember: values.remember });
      onAuthenticated(user);
    } catch (err) {
      setFormError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const toggle = <PasswordToggle shown={showPassword} onToggle={() => setShowPassword((s) => !s)} />;

  return (
    <div className="grid min-h-screen bg-paper lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="hidden flex-col justify-between bg-ink p-12 text-paper lg:flex">
        <div className="flex items-center gap-3">
          <BrandMark size={34} />
          <span className="mm-display text-xl font-semibold">MeetMind</span>
        </div>
        <div>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#e08a4f]">Meeting operations workspace</p>
          <h2 className="mm-display max-w-md text-5xl font-semibold leading-[1.08]">Meetings end. Commitments shouldn’t.</h2>
          <dl className="mt-10 max-w-md space-y-5 border-t border-paper/15 pt-8 text-sm leading-relaxed text-paper/75">
            <div><dt className="font-semibold text-paper">Decisions on the record</dt><dd>Summaries and key decisions pulled straight from the transcript.</dd></div>
            <div><dt className="font-semibold text-paper">Owners and deadlines</dt><dd>Action items you can scan, with “Not specified” where the transcript is silent.</dd></div>
            <div><dt className="font-semibold text-paper">Follow-through</dt><dd>Send the recap by Gmail and put the follow-up on Google Calendar.</dd></div>
          </dl>
        </div>
        <p className="text-xs text-paper/50">Local prototype · accounts stay in this browser</p>
      </aside>

      <main className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <BrandMark size={32} />
            <span className="mm-display text-xl font-semibold">MeetMind</span>
          </div>
          <h1 className="mm-display text-3xl font-semibold text-ink">{signingUp ? "Create your account" : "Welcome back"}</h1>
          <p className="mt-2 text-[15px] text-ink-2">
            {signingUp ? "Set up a local profile to keep your meeting history together." : "Sign in to open your meeting workspace."}
          </p>

          <form onSubmit={submit} noValidate className="mt-8 space-y-4" aria-label={signingUp ? "Sign up" : "Sign in"}>
            {formError && <Alert type="error">{formError}</Alert>}
            {signingUp && <Field id="auth-name" label="Full name" autoComplete="name" value={values.name} onChange={set("name")} error={errors.name} />}
            <Field id="auth-email" label="Email" type="email" autoComplete="email" inputMode="email" placeholder="name@example.com" value={values.email} onChange={set("email")} error={errors.email} />
            <Field
              id="auth-password" label="Password" type={showPassword ? "text" : "password"} trailing={toggle}
              autoComplete={signingUp ? "new-password" : "current-password"} value={values.password} onChange={set("password")} error={errors.password}
              hint={signingUp ? `At least ${PASSWORD_MIN_LENGTH} characters with a letter and a number.` : undefined}
            />
            {signingUp && (
              <Field id="auth-confirm" label="Confirm password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={values.confirm} onChange={set("confirm")} error={errors.confirm} />
            )}
            {!signingUp && (
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-2">
                <input type="checkbox" checked={values.remember} onChange={set("remember")} className="h-4 w-4 accent-cobalt" />
                Remember me on this browser
              </label>
            )}
            <Button type="submit" variant="primary" loading={loading} className="w-full py-3">
              {loading ? (signingUp ? "Creating account…" : "Signing in…") : signingUp ? "Create account" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-2">
            {signingUp ? "Already have an account?" : "New to MeetMind?"}{" "}
            <button type="button" onClick={() => switchMode(signingUp ? "signin" : "signup")} className="font-semibold text-cobalt underline-offset-2 hover:underline">
              {signingUp ? "Sign in" : "Create an account"}
            </button>
          </p>

          <div className="mt-8 flex gap-2.5 rounded-md border border-line bg-paper-2/60 p-3.5 text-xs leading-relaxed text-mute">
            <ShieldAlert size={16} className="mt-0.5 shrink-0 text-ember" aria-hidden="true" />
            <p><strong className="font-semibold text-ink-2">Local prototype.</strong> Accounts are stored only in this browser, with passwords salted and hashed. This is not production-grade authentication and the backend does not know who you are.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
