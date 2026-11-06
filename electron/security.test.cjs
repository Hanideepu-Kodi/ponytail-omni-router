const assert = require("node:assert/strict");
const test = require("node:test");
const {
  getEndpointPolicy,
  isAllowedRendererUrl,
  isLoopbackEndpoint,
  parseEndpoint,
} = require("./security.cjs");

test("allows keyless loopback endpoints", () => {
  const endpoint = parseEndpoint("http://127.0.0.1:20128/v1/");
  assert.equal(endpoint.href, "http://127.0.0.1:20128/v1");
  assert.equal(isLoopbackEndpoint(endpoint), true);
  assert.deepEqual(getEndpointPolicy(endpoint, ""), { configured: true });
});

test("requires HTTPS and a key for remote endpoints", () => {
  const insecure = getEndpointPolicy(parseEndpoint("http://example.com/v1"), "secret");
  const keyless = getEndpointPolicy(parseEndpoint("https://example.com/v1"), "");
  const secure = getEndpointPolicy(parseEndpoint("https://example.com/v1"), "secret");

  assert.equal(insecure.configured, false);
  assert.match(insecure.error, /HTTPS/);
  assert.equal(keyless.configured, false);
  assert.match(keyless.error, /OMNIROUTE_API_KEY/);
  assert.deepEqual(secure, { configured: true });
});

test("rejects malformed or credential-bearing endpoints", () => {
  assert.throws(() => parseEndpoint("not a URL"), /valid HTTP/);
  assert.throws(() => parseEndpoint("file:///tmp/socket"), /HTTP or HTTPS/);
  assert.throws(() => parseEndpoint("https://user:pass@example.com/v1"), /credentials/);
});

test("only trusts the renderer entry page", () => {
  const entry = "http://127.0.0.1:5173/";
  assert.equal(isAllowedRendererUrl(entry, entry), true);
  assert.equal(isAllowedRendererUrl("http://127.0.0.1:5173/other", entry), false);
  assert.equal(isAllowedRendererUrl("https://example.com/", entry), false);
});
