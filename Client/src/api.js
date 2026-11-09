const configuredApiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:9999";
const API_URL = configuredApiUrl.replace(/\/+$/, "");

export default API_URL;
