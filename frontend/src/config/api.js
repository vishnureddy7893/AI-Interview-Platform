import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Authorization header from unified auth object
api.interceptors.request.use((config) => {
  // Never overwrite explicitly provided headers
  if (config.headers.Authorization) {
    return config;
  }

  try {
    const stored = localStorage.getItem("auth");
    if (stored) {
      const auth = JSON.parse(stored);
      if (auth?.token) {
        config.headers.Authorization = `Bearer ${auth.token}`;
      }
    }
  } catch {
    // localStorage empty or malformed — skip auth attachment
  }

  return config;
});

// Handle generic HTTP errors — no side effects, return to caller
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;