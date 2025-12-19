// js/api.js

const API_URL = "https://script.google.com/macros/s/AKfycbwCf_xG1SPGCxDrl8MnjmJFQUwcrjaevdjfG35D--vVqJ7SkWJ5eR_lrf0hTev7CRW5/exec";

/**
 * callAPI(path, payload)
 * - auto attach session_token
 * - handle standard response
 */
async function callAPI(path, payload = {}) {
  const sessionToken = localStorage.getItem("session_token") || "";

  const body = {
    path,
    session_token: sessionToken,
    payload
  };

  let res, json;

  try {
    res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    json = await res.json();
  } catch (err) {
    throw new Error("NETWORK_ERROR");
  }

  if (!json.ok) {
    if (json.code === "UNAUTHORIZED") {
      logoutAndRedirect();
    }
    throw new Error(json.message || json.code);
  }

  return json.data;
}
