// js/auth.js

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", onLogin);
  }
});

async function onLogin(e) {
  e.preventDefault();

  const userId = document.getElementById("userId").value.trim();
  const pin = document.getElementById("pin").value.trim();
  const errorMsg = document.getElementById("errorMsg");

  errorMsg.classList.add("hidden");

  try {
    const result = await callAPI("/auth/login", {
      user_id: userId,
      pin: pin
    });

    localStorage.setItem("session_token", result.session_token);

    redirectByRole(result.user.role);
  } catch (err) {
    errorMsg.textContent = "เข้าสู่ระบบไม่สำเร็จ";
    errorMsg.classList.remove("hidden");
  }
}

function redirectByRole(role) {
  if (role === "GUARD") {
    location.href = "guard.html";
  } else if (role === "RESIDENT") {
    location.href = "resident.html";
  } else if (role === "CENTER" || role === "ADMIN") {
    location.href = "center.html";
  } else {
    logoutAndRedirect();
  }
}

function logoutAndRedirect() {
  localStorage.removeItem("session_token");
  location.href = "index.html";
}
