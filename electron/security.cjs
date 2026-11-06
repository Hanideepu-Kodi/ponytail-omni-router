const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "[::1]"]);

function parseEndpoint(value) {
  let endpoint;
  try {
    endpoint = new URL(value);
  } catch {
    throw new Error("OMNIROUTE_BASE_URL must be a valid HTTP(S) URL.");
  }

  if (!new Set(["http:", "https:"]).has(endpoint.protocol)) {
    throw new Error("OMNIROUTE_BASE_URL must use HTTP or HTTPS.");
  }
  if (endpoint.username || endpoint.password || endpoint.search || endpoint.hash) {
    throw new Error("OMNIROUTE_BASE_URL cannot contain credentials, a query, or a fragment.");
  }

  endpoint.pathname = endpoint.pathname.replace(/\/$/, "");
  return endpoint;
}

function isLoopbackEndpoint(endpoint) {
  return LOOPBACK_HOSTS.has(endpoint.hostname);
}

function getEndpointPolicy(endpoint, apiKey) {
  if (isLoopbackEndpoint(endpoint)) return { configured: true };
  if (endpoint.protocol !== "https:") {
    return { configured: false, error: "Remote OmniRoute endpoints must use HTTPS." };
  }
  if (!apiKey) {
    return {
      configured: false,
      error: "Add OMNIROUTE_API_KEY to .env.local, then restart the app.",
    };
  }
  return { configured: true };
}

function isAllowedRendererUrl(value, entryUrl) {
  try {
    const candidate = new URL(value);
    const entry = new URL(entryUrl);
    if (entry.protocol === "file:") return candidate.href === entry.href;
    return candidate.origin === entry.origin && candidate.pathname === entry.pathname;
  } catch {
    return false;
  }
}

module.exports = { getEndpointPolicy, isAllowedRendererUrl, isLoopbackEndpoint, parseEndpoint };
