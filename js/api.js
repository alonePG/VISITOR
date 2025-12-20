// js/api.js
const API_URL = "https://script.google.com/macros/s/AKfycbyx4-OkRIo6WcS59FaZcpajDBxFDGujCA9oCyRk3XcpOsK5vVWDo78xJC5sFYuMj3d1/exec";

async function callAPI(path, payload = {}) {
  const sessionToken = localStorage.getItem("session_token") || "";

  const bodyObj = { path, session_token: sessionToken, payload };

  const formBody = new URLSearchParams();
  formBody.set("data", JSON.stringify(bodyObj));

  const res = await fetch(API_URL, {
    method: "POST",
    // ✅ ไม่ใส่ headers เลย -> กันพลาดเรื่อง content-type
    body: formBody
  });

  const json = await res.json();

  if (!json || json.ok !== true) {
    if (json && json.code === "UNAUTHORIZED") logoutAndRedirect();
    throw new Error((json && (json.message || json.code)) || "API_ERROR");
  }
  return json.data;
}
