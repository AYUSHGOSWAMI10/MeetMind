// LOCAL PROTOTYPE AUTHENTICATION — NOT PRODUCTION SECURE.
// Accounts live in this browser's localStorage only. Passwords are never stored
// in plaintext: each is salted and hashed with PBKDF2-SHA256 (Web Crypto). Anyone
// with access to the browser profile can still read, copy or delete the data, and
// there is no server-side session, rate limiting or account recovery.
const ACCOUNTS_KEY = "meetmind.accounts.v1";
const SESSION_KEY = "meetmind.session.v1";
const OWNERSHIP_KEY = "meetmind.ownership.v1";
const ITERATIONS = 210000;

export const PASSWORD_MIN_LENGTH = 8;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function read(storage, key, fallback) {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(storage, key, value) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    throw new Error("Browser storage is unavailable, so local accounts can't be saved.");
  }
}

const toB64 = (bytes) => btoa(String.fromCharCode(...bytes));
const fromB64 = (text) => Uint8Array.from(atob(text), (c) => c.charCodeAt(0));

async function derive(password, salt, iterations) {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Secure hashing is unavailable here. Open the app over https or http://localhost.");
  }
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256);
  return toB64(new Uint8Array(bits));
}

function sameHash(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const normalizeEmail = (email) => email.trim().toLowerCase();
const accounts = () => read(localStorage, ACCOUNTS_KEY, []);
const publicUser = ({ id, name, email, createdAt }) => ({ id, name, email, createdAt });

function startSession(userId, remember) {
  endSession();
  write(remember ? localStorage : sessionStorage, SESSION_KEY, { userId });
}

function endSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
}

export function getSessionUser() {
  const session = read(localStorage, SESSION_KEY, null) || read(sessionStorage, SESSION_KEY, null);
  const account = session && accounts().find((a) => a.id === session.userId);
  return account ? publicUser(account) : null;
}

export async function signUp({ name, email, password }) {
  const list = accounts();
  const normalized = normalizeEmail(email);
  if (list.some((a) => a.email === normalized)) {
    throw new Error("An account with this email already exists in this browser. Try signing in.");
  }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const account = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalized,
    salt: toB64(salt),
    iterations: ITERATIONS,
    hash: await derive(password, salt, ITERATIONS),
    createdAt: new Date().toISOString(),
  };
  write(localStorage, ACCOUNTS_KEY, [...list, account]);
  startSession(account.id, true);
  return publicUser(account);
}

export async function signIn({ email, password, remember }) {
  const account = accounts().find((a) => a.email === normalizeEmail(email));
  // Hash even when the account is missing so both failures take similar time.
  const salt = account ? fromB64(account.salt) : crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt, account?.iterations || ITERATIONS);
  if (!account || !sameHash(hash, account.hash)) throw new Error("Incorrect email or password.");
  startSession(account.id, remember);
  return publicUser(account);
}

export function signOut() {
  endSession();
}

export function updateProfile(userId, { name, email }) {
  const list = accounts();
  const normalized = normalizeEmail(email);
  if (list.some((a) => a.id !== userId && a.email === normalized)) {
    throw new Error("Another local account already uses this email.");
  }
  const next = list.map((a) => (a.id === userId ? { ...a, name: name.trim(), email: normalized } : a));
  write(localStorage, ACCOUNTS_KEY, next);
  return publicUser(next.find((a) => a.id === userId));
}

// Frontend-only history association: remembers which saved-meeting ids were
// analyzed while this account was signed in. The backend does NOT isolate data
// per user; every meeting in SQLite remains reachable through the API.
export function getOwnedIds(userId) {
  return read(localStorage, OWNERSHIP_KEY, {})[userId] || [];
}

export function addOwnedId(userId, meetingId) {
  const map = read(localStorage, OWNERSHIP_KEY, {});
  const ids = new Set(map[userId] || []);
  ids.add(meetingId);
  try { write(localStorage, OWNERSHIP_KEY, { ...map, [userId]: [...ids] }); } catch { /* history link is best-effort */ }
}

export function forgetOwnedId(meetingId) {
  const map = read(localStorage, OWNERSHIP_KEY, {});
  const next = Object.fromEntries(Object.entries(map).map(([u, ids]) => [u, ids.filter((id) => id !== meetingId)]));
  try { write(localStorage, OWNERSHIP_KEY, next); } catch { /* best-effort */ }
}
