export const SESSION_DURATION_MS = 60 * 60 * 1000;

const LOGIN_AT_KEY = "loginAt";
const EXPIRED_MESSAGE_KEY = "sessionExpiredMessage";
const SESSION_EXPIRED_EVENT = "app:session-expired";
const LOGIN_PATH = "/login?expired=1";

let fetchInterceptorInstalled = false;

export function startSession(token, user) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem(LOGIN_AT_KEY, String(Date.now()));
    localStorage.removeItem(EXPIRED_MESSAGE_KEY);
}

export function clearSession() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem(LOGIN_AT_KEY);
}

export function getSessionElapsedMs() {
    const loginAt = Number(localStorage.getItem(LOGIN_AT_KEY));
    if (!Number.isFinite(loginAt) || loginAt <= 0) return 0;

    return Date.now() - loginAt;
}

export function getSessionRemainingMs() {
    return Math.max(0, SESSION_DURATION_MS - getSessionElapsedMs());
}

export function isSessionExpired() {
    const token = localStorage.getItem("token");
    if (!token) return false;

    const loginAt = Number(localStorage.getItem(LOGIN_AT_KEY));
    if (!Number.isFinite(loginAt) || loginAt <= 0) {
        localStorage.setItem(LOGIN_AT_KEY, String(Date.now()));
        return false;
    }

    return Date.now() - loginAt >= SESSION_DURATION_MS;
}

export function expireSession(message = "Your session expired after 60 minutes. Please sign in again.") {
    if (!localStorage.getItem("token") && !localStorage.getItem("user")) return;

    clearSession();
    localStorage.setItem(EXPIRED_MESSAGE_KEY, message);
    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT, { detail: { message } }));
}

export function getSessionExpiredMessage() {
    const message = localStorage.getItem(EXPIRED_MESSAGE_KEY);
    localStorage.removeItem(EXPIRED_MESSAGE_KEY);
    return message;
}

export function getActiveToken() {
    if (isSessionExpired()) {
        expireSession();
        return null;
    }

    return localStorage.getItem("token");
}

export function onSessionExpired(handler) {
    const listener = (event) => handler(event.detail?.message);
    window.addEventListener(SESSION_EXPIRED_EVENT, listener);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, listener);
}

function requestUrl(input) {
    if (typeof input === "string") return input;
    if (input instanceof URL) return input.toString();
    return input?.url ?? "";
}

function isAuthEndpoint(url) {
    return url.includes("/api/auth/login") || url.includes("/api/auth/register");
}

export function installSessionFetchInterceptor() {
    if (fetchInterceptorInstalled || typeof window === "undefined" || !window.fetch) return;

    fetchInterceptorInstalled = true;
    const originalFetch = window.fetch.bind(window);

    window.fetch = async (...args) => {
        const response = await originalFetch(...args);
        const url = requestUrl(args[0]);

        if (response.status === 401 && !isAuthEndpoint(url) && localStorage.getItem("token")) {
            expireSession("Your session expired. Please sign in again.");
            if (window.location.pathname !== "/login") {
                window.location.assign(LOGIN_PATH);
            }
        }

        return response;
    };
}
