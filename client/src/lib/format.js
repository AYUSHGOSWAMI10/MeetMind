// SQLite stores created_at as "YYYY-MM-DD HH:MM:SS" in UTC.
export function parseCreatedAt(value) {
  if (!value) return null;
  const date = new Date(`${String(value).replace(" ", "T")}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateTime(value) {
  const date = parseCreatedAt(value);
  return date ? date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "";
}

export function formatDate(value) {
  const date = value instanceof Date ? value : parseCreatedAt(value);
  return date ? date.toLocaleDateString(undefined, { dateStyle: "medium" }) : "";
}

export function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export function isUnspecified(value) {
  return !value || /^not specified$/i.test(String(value).trim());
}
