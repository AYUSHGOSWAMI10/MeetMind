import { useState } from "react";
import { LogOut, Pencil } from "lucide-react";
import { EMAIL_PATTERN, updateProfile } from "../lib/auth";
import { formatDate, initials } from "../lib/format";
import { Alert, Button, Field, PageHeader, Panel } from "./ui";

export default function ProfileView({ user, onUserChange, onLogout, meetingCount }) {
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState({ name: user.name, email: user.email });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saved, setSaved] = useState(false);

  function startEdit() {
    setValues({ name: user.name, email: user.email });
    setErrors({});
    setFormError("");
    setSaved(false);
    setEditing(true);
  }

  function save(e) {
    e.preventDefault();
    const found = {};
    if (values.name.trim().length < 2) found.name = "Enter your full name.";
    if (!EMAIL_PATTERN.test(values.email.trim())) found.email = "Enter a valid email address.";
    setErrors(found);
    setFormError("");
    if (Object.keys(found).length) return;
    try {
      onUserChange(updateProfile(user.id, values));
      setEditing(false);
      setSaved(true);
    } catch (err) {
      setFormError(err.message);
    }
  }

  const rows = [
    ["Full name", user.name],
    ["Email", user.email],
    ["Member since", formatDate(user.createdAt) || "—"],
    ["Meetings tracked under this account", String(meetingCount)],
    ["Account storage", "This browser only (local prototype)"],
  ];

  return (
    <div>
      <PageHeader eyebrow="Profile" title="Your account" description="Your local MeetMind profile. It lives in this browser and is not shared with the backend." />
      {saved && <Alert type="success" className="mb-6">Profile updated.</Alert>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-lg font-semibold text-paper">{initials(user.name)}</span>
            <div className="min-w-0">
              <h2 className="mm-display truncate text-2xl font-semibold text-ink">{user.name}</h2>
              <p className="truncate text-sm text-ink-2">{user.email}</p>
            </div>
          </div>

          {editing ? (
            <form onSubmit={save} noValidate aria-label="Edit profile" className="space-y-4 border-t border-line pt-6">
              {formError && <Alert type="error">{formError}</Alert>}
              <Field id="profile-name" label="Full name" autoComplete="name" value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} error={errors.name} />
              <Field id="profile-email" label="Email" type="email" autoComplete="email" value={values.email} onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))} error={errors.email} />
              <div className="flex gap-3">
                <Button type="submit" variant="primary">Save changes</Button>
                <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </form>
          ) : (
            <>
              <dl className="divide-y divide-line border-t border-line">
                {rows.map(([label, value]) => (
                  <div key={label} className="flex flex-wrap justify-between gap-x-6 gap-y-1 py-3 text-sm">
                    <dt className="text-mute">{label}</dt>
                    <dd className="break-all font-medium text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
              <Button icon={Pencil} onClick={startEdit} className="mt-6">Edit profile</Button>
            </>
          )}
        </Panel>

        <Panel className="h-fit p-6">
          <h2 className="mm-display text-lg font-semibold text-ink">Session</h2>
          <p className="mb-5 mt-2 text-sm leading-relaxed text-ink-2">Logging out ends this session. Your local account and its meeting associations stay in this browser for next time.</p>
          <Button variant="danger" icon={LogOut} onClick={onLogout} className="w-full">Log out</Button>
        </Panel>
      </div>
    </div>
  );
}
