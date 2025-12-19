// js/resident.js
document.addEventListener("DOMContentLoaded", initResident);

async function initResident() {
  bindLogout();
  await loadMe();
  await loadPending();
  bindCreatePass();
}

/* =========================
   Session / User
========================= */

let ME = null;

async function loadMe() {
  try {
    const res = await callAPI("/me");
    ME = res.user;
  } catch (e) {
    logoutAndRedirect();
  }
}

function bindLogout() {
  const btn = qs("logoutBtn");
  if (btn) btn.addEventListener("click", logoutAndRedirect);
}

/* =========================
   Pending Visits
========================= */

async function loadPending() {
  const box = qs("pendingList");
  box.innerHTML = "<p class='muted'>กำลังโหลด...</p>";

  try {
    // ดึง VISITS ทั้งหมด แล้วคัดเฉพาะของ unit ตัวเอง
    // (MVP: backend ยังไม่มี endpoint เฉพาะ resident)
    const daily = await callAPI("/report/daily"); // วันนี้
    const list = daily.filter(v =>
      v.visitor_type && v.unit_code === ME.unit_code
    );

    if (!list.length) {
      box.innerHTML = "<p class='muted'>ไม่มีรายการรออนุมัติ</p>";
      return;
    }

    box.innerHTML = "";
    list.forEach(v => {
      const card = document.createElement("div");
      card.className = "pending-card";
      card.innerHTML = `
        <div>
          <b>${v.visit_id}</b>
          <div>ประเภท: ${v.visitor_type}</div>
          <div>มาถึง: ${formatTime(v.arrived_at)}</div>
        </div>
        <div class="actions">
          <button data-id="${v.visit_id}" data-action="approve">อนุมัติ</button>
          <button data-id="${v.visit_id}" data-action="reject">ปฏิเสธ</button>
        </div>
      `;
      box.appendChild(card);
    });

    box.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", onDecision);
    });

  } catch (err) {
    box.innerHTML = "<p class='error'>โหลดข้อมูลไม่สำเร็จ</p>";
  }
}

async function onDecision(e) {
  const visitId = e.target.dataset.id;
  const action = e.target.dataset.action;

  try {
    if (action === "approve") {
      await callAPI("/visit/in", { visit_id: visitId });
    } else {
      await callAPI("/visit/close", { visit_id: visitId });
    }
    await loadPending();
  } catch (err) {
    alert("ดำเนินการไม่สำเร็จ");
  }
}

/* =========================
   Create Visitor Pass
========================= */

function bindCreatePass() {
  const form = qs("createPassForm");
  if (!form) return;

  form.addEventListener("submit", async e => {
    e.preventDefault();

    const visitorType = qs("passVisitorType").value;
    const note = qs("passNote").value.trim();
    const maxUses = Number(qs("passMaxUses").value || 1);

    if (!visitorType) {
      alert("กรุณาเลือกประเภทผู้มาติดต่อ");
      return;
    }

    try {
      const res = await callAPI("/pass/create", {
        visitor_type: visitorType,
        note: note,
        max_uses: maxUses
      });

      showPassResult(res);
      form.reset();
    } catch (err) {
      alert("สร้าง Pass ไม่สำเร็จ");
    }
  });
}

function showPassResult(res) {
  const box = qs("passResult");
  box.innerHTML = `
    <p><b>สร้าง Pass สำเร็จ</b></p>
    <p>Token:</p>
    <code>${res.raw_token}</code>
    <p class="muted">ใช้ได้ ${res.max_uses} ครั้ง</p>
  `;
  box.classList.remove("hidden");
}

/* =========================
   Helpers
========================= */

function formatTime(t) {
  if (!t) return "-";
  const d = new Date(t);
  return d.toLocaleString("th-TH");
}
