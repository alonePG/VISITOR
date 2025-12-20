// js/api.js

const API_URL = "https://script.google.com/macros/s/AKfycbxm00s_kS-974cUyz9jJbsKU8_wgo3iUMb_8b8Egp75wUpyRh6bR-mUyjYGqCV1VQQp/exec";

/**
 * callAPI(path, payload)
 * - auto attach session_token
 * - send as x-www-form-urlencoded (avoid CORS preflight)
 */
async function callAPI(path, payload = {}) {
  const sessionToken = localStorage.getItem("session_token") || "";

  const bodyObj = {
    path,
    session_token: sessionToken,
    payload
  };

  // ✅ ส่งแบบฟอร์มเพื่อหลบ preflight
  const formBody = new URLSearchParams();
  formBody.set("data", JSON.stringify(bodyObj));

  let res, json;

  try {
    res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      body: formBody.toString()
    });

    json = await res.json();
  } catch (err) {
    throw new Error("NETWORK_ERROR");
  }

  if (!json || json.ok !== true) {
    if (json && json.code === "UNAUTHORIZED") {
      logoutAndRedirect();
    }
    throw new Error((json && (json.message || json.code)) || "API_ERROR");
  }

  return json.data;
}
