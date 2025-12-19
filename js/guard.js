// js/guard.js
document.addEventListener("DOMContentLoaded", initGuard);

async function initGuard() {
  bindLogout();
  await loadMe();
  bindCreateVisit();
  bindInOut();
}

/* =========================
   Session / User
========================= */

async function loadMe() {
  try {
    const me = await callAPI("/me");
    qs("app").dataset.gate = me.user.gate_code || "";
  } catch (err) {
    logoutAndRedirect();
  }
}

function bindLogout() {
  const btn = qs("logoutBtn");
  if (btn) {
    btn.addEventListener("click", logoutAndRedirect);
  }
}

/* =========================
   Create Visit
========================= */

function bindCreateVisit() {
  const form = qs("createVisitForm");
  if (!form) return;

  form.addEventListener("submit", async e => {
    e.preventDefault();

    const visitorType = qs("visitorType").value;
    const unitCode = qs("unitCode").value.trim();
    const note = qs("plateOrNote").value.trim();

    if (!visitorType || !unitCode) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    try {
      const res = await callAPI("/visit/create", {
        visitor_type: visitorType,
        unit_code: unitCode,
        plate_or_note: note
      });

      alert(`สร้าง Visit สำเร็จ\nID: ${res.visit_id}\nState: ${res.state}`);
      form.reset();
    } catch (err) {
      alert("สร้าง Visit ไม่สำเร็จ");
    }
  });
}

/* =========================
   IN / OUT
========================= */

function bindInOut() {
  const inBtn = qs("inBtn");
  const outBtn = qs("outBtn");

  if (inBtn) {
    inBtn.addEventListener("click", () => handleInOut("in"));
  }
  if (outBtn) {
    outBtn.addEventListener("click", () => handleInOut("out"));
  }
}

async function handleInOut(type) {
  const visitId = qs("visitIdAction").value.trim();
  if (!visitId) {
    alert("กรุณากรอก Visit ID");
    return;
  }

  try {
    const path = type === "in" ? "/visit/in" : "/visit/out";
    const res = await callAPI(path, { visit_id: visitId });

    alert(`สำเร็จ: ${res.state}`);
  } catch (err) {
    alert("ดำเนินการไม่สำเร็จ");
  }
}
