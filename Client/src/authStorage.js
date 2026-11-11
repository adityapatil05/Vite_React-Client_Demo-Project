const TOKEN_KEY = "token";
const TOKEN_EXPIRY_KEY = "tokenExpiry";
const SESSION_LIFETIME_MS = 60 * 24 * 60 * 60 * 1000;

export const saveToken = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + SESSION_LIFETIME_MS));
};

export const getToken = () => {
    let token = localStorage.getItem(TOKEN_KEY);
    let expiry = Number(localStorage.getItem(TOKEN_EXPIRY_KEY));

    if (!token) {
        token = sessionStorage.getItem(TOKEN_KEY);
        if (token) {
            saveToken(token);
            sessionStorage.removeItem(TOKEN_KEY);
            expiry = Number(localStorage.getItem(TOKEN_EXPIRY_KEY));
        }
    }

    if (!token || !Number.isFinite(expiry) || Date.now() >= expiry) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(TOKEN_EXPIRY_KEY);
        return null;
    }

    return token;
};

export const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
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
