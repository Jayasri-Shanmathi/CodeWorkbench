import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
});

// Helper to read cookie by name
export function getCookie(name) {
  let cookieValue = null;

  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();

      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(
          cookie.substring(name.length + 1)
        );
        break;
      }
    }
  }

  return cookieValue;
}

let cachedCsrfToken =
  localStorage.getItem("cw_csrftoken") || null;

export function setCsrfToken(token) {
  cachedCsrfToken = token;

  if (token) {
    localStorage.setItem("cw_csrftoken", token);
  } else {
    localStorage.removeItem("cw_csrftoken");
  }
}

export async function fetchCsrfToken() {
  try {
    const res = await axios.get(`${API_BASE_URL}csrf/`, {
      withCredentials: true,
    });

    if (res.data && res.data.csrfToken) {
      setCsrfToken(res.data.csrfToken);
      return res.data.csrfToken;
    }
  } catch (err) {
    console.error("Failed to fetch CSRF token:", err);
  }

  return null;
}

// Request Interceptor:
// Attach X-CSRFToken to unsafe methods
// POST, PUT, PATCH, DELETE
api.interceptors.request.use(
  async (config) => {
    const method = config.method
      ? config.method.toLowerCase()
      : "get";

    const unsafeMethods = [
      "post",
      "put",
      "patch",
      "delete",
    ];

    if (unsafeMethods.includes(method)) {
      // 1. Check cookie or cached token
      let token =
        getCookie("csrftoken") || cachedCsrfToken;

      // 2. If no token found, fetch fresh one
      if (!token) {
        token = await fetchCsrfToken();
      }

      if (token) {
        config.headers["X-CSRFToken"] = token;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor:
// Capture rotated CSRF tokens or retry once
// on CSRF-related 403 failure
api.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      response.data.csrfToken
    ) {
      setCsrfToken(response.data.csrfToken);
    }

    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isCsrfError =
      error.response &&
      error.response.status === 403 &&
      !originalRequest._retry &&
      (
        JSON.stringify(
          error.response.data || ""
        )
          .toLowerCase()
          .includes("csrf") ||
        error.response.statusText
          ?.toLowerCase()
          .includes("forbidden")
      );

    if (isCsrfError) {
      originalRequest._retry = true;

      const newToken = await fetchCsrfToken();

      if (newToken) {
        originalRequest.headers["X-CSRFToken"] =
          newToken;

        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export default api;