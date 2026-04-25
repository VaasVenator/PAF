const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

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

function handleFetchError(error) {
  // Network errors, timeouts, or fetch failures
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return new Error(
      `Unable to connect to the backend server (${API_BASE_URL}). ` +
      `Please ensure the backend is running and accessible.`
    );
  }
  return error;
}

export async function apiGet(path, user, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: buildHeaders(user, options.headers),
      credentials: options.credentials
    });
    return parseResponse(response);
  } catch (error) {
    throw handleFetchError(error);
  }
}

export async function apiPost(path, body, user, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: buildHeaders(user, options.headers),
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: options.credentials
    });
    return parseResponse(response);
  } catch (error) {
    throw handleFetchError(error);
  }
}

export async function apiPut(path, body, user, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "PUT",
      headers: buildHeaders(user, options.headers),
      body: JSON.stringify(body),
      credentials: options.credentials
    });
    return parseResponse(response);
  } catch (error) {
    throw handleFetchError(error);
  }
}

export async function apiDelete(path, user, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "DELETE",
      headers: buildHeaders(user, options.headers),
      credentials: options.credentials
    });
    return parseResponse(response);
  } catch (error) {
    throw handleFetchError(error);
  }
}

export async function apiPatch(path, body, user, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "PATCH",
      headers: buildHeaders(user, options.headers),
      body: JSON.stringify(body),
      credentials: options.credentials
    });
    return parseResponse(response);
  } catch (error) {
    throw handleFetchError(error);
  }
}

export { API_BASE_URL };
