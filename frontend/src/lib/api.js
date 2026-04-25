const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
const DEFAULT_TIMEOUT_MS = 15000;

function buildUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}` || normalizedPath;
}

function buildHeaders(user, extraHeaders = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...extraHeaders
  };

  if (user) {
    headers["X-User-Id"] = user.userId;
    headers["X-User-Name"] = user.displayName;
    headers["X-User-Role"] = user.role;
  }

  return headers;
}

async function parseResponse(response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const message = payload?.message ?? `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

async function request(path, { method = "GET", body, user, options = {} } = {}) {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(buildUrl(path), {
      method,
      headers: buildHeaders(user, options.headers),
      body,
      credentials: options.credentials,
      signal: controller.signal
    });
    return parseResponse(response);
  } catch (error) {
    const baseTarget = API_BASE_URL || "same-origin /api proxy";
    const baseMessage = `Unable to reach backend via ${baseTarget}. Ensure the backend is running and the dev proxy or API base URL is configured correctly.`;
    if (error?.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs}ms. ${baseMessage}`);
    }
    throw new Error(baseMessage);
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function apiGet(path, user, options = {}) {
  return request(path, { method: "GET", user, options });
}

export async function apiPost(path, body, user, options = {}) {
  return request(path, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
    user,
    options
  });
}

export async function apiPut(path, body, user, options = {}) {
  return request(path, {
    method: "PUT",
    body: JSON.stringify(body),
    user,
    options
  });
}

export async function apiDelete(path, user, options = {}) {
  return request(path, { method: "DELETE", user, options });
}

export async function apiPatch(path, body, user, options = {}) {
  return request(path, {
    method: "PATCH",
    body: JSON.stringify(body),
    user,
    options
  });
}

export { API_BASE_URL };
