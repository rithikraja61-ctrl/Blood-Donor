import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../utils/constants';

function readFrom(storage, key) {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function writeTo(storage, key, value) {
  try {
    storage.setItem(key, value);
  } catch {
    // ignore quota / private mode errors
  }
}

function removeFrom(storage, key) {
  try {
    storage.removeItem(key);
  } catch {
    // ignore
  }
}

/** One-time move from shared localStorage so existing sessions keep working in this tab. */
function migrateLegacyAuthIfNeeded() {
  if (readFrom(sessionStorage, AUTH_TOKEN_KEY)) return;

  const legacyToken = readFrom(localStorage, AUTH_TOKEN_KEY);
  const legacyUser = readFrom(localStorage, AUTH_USER_KEY);

  if (legacyToken) {
    writeTo(sessionStorage, AUTH_TOKEN_KEY, legacyToken);
  }
  if (legacyUser) {
    writeTo(sessionStorage, AUTH_USER_KEY, legacyUser);
  }

  removeFrom(localStorage, AUTH_TOKEN_KEY);
  removeFrom(localStorage, AUTH_USER_KEY);
}

export function getAuthToken() {
  migrateLegacyAuthIfNeeded();
  return readFrom(sessionStorage, AUTH_TOKEN_KEY);
}

export function getAuthUserRaw() {
  migrateLegacyAuthIfNeeded();
  return readFrom(sessionStorage, AUTH_USER_KEY);
}

export function getAuthUser() {
  const raw = getAuthUserRaw();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAuthSession(token, user) {
  writeTo(sessionStorage, AUTH_TOKEN_KEY, token);
  writeTo(sessionStorage, AUTH_USER_KEY, JSON.stringify(user));
  removeFrom(localStorage, AUTH_TOKEN_KEY);
  removeFrom(localStorage, AUTH_USER_KEY);
}

export function clearAuthSession() {
  removeFrom(sessionStorage, AUTH_TOKEN_KEY);
  removeFrom(sessionStorage, AUTH_USER_KEY);
  removeFrom(localStorage, AUTH_TOKEN_KEY);
  removeFrom(localStorage, AUTH_USER_KEY);
}
