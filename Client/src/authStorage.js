const TOKEN_KEY = "token";
const TOKEN_EXPIRY_KEY = "tokenExpiry";
const SESSION_LIFETIME_MS = 60 * 24 * 60 * 60 * 1000;

export const saveToken = (token) => {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + SESSION_LIFETIME_MS));
};

export const getToken = () => {
    const token = sessionStorage.getItem(TOKEN_KEY);
    const expiry = Number(sessionStorage.getItem(TOKEN_EXPIRY_KEY));

    if (!token || !Number.isFinite(expiry) || Date.now() >= expiry) {
        clearToken();
        return null;
    }

    return token;
};

export const clearToken = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
};

export const getTokenPayload = () => {
    const token = getToken();
    if (!token) {
        return null;
    }

    try {
        return JSON.parse(atob(token.split(".")[1]));
    } catch {
        clearToken();
        return null;
    }
};
