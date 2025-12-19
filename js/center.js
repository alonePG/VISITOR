// js/center.js
document.addEventListener("DOMContentLoaded", initCenter);

async function initCenter() {
  bindLogout();
  await loadMe();
  bindSearch();
  bindReports();
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
   Search / Filter VISITS
========================= */

function bindSearch() {
  const btn = qs("searchBtn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const q = qs("searchVisitId").value.trim();
    const state = qs("filterState").value;

    const box = qs("visitResult");
    box.innerHTML = "<p class='muted'>กำลังค้นหา...</p>";

    try {
      // MVP: ใช้ daily report เป็นแหล่งข้อมูลค้นหา
      const list = await callAPI("/report/daily");

      let rows = list;
      if (q) {
        rows = rows.filter(v =>
          v.visit_id.includes(q) || String(v.unit_code || "").includes(q)
        );
      }
      if (state) {
        rows = rows.filter(v => v.state === state);
      }

      renderVisitTable(rows);
    } catch (err) {
      box.innerHTML = "<p class='error'>ค้นหาไม่สำเร็จ</p>";
    }
  });
}

function renderVisitTable(rows) {
  const box = qs("visitResult");
  if (!rows.length) {
    box.innerHTML = "<p class='muted'>ไม่พบข้อมูล</p>";
    return;
  }

  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>Visit ID</th>
        <th>Unit</th>
        <th>Type</th>
        <th>Arrived</th>
        <th>State</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tb = table.querySelector("tbody");

  rows.forEach(v => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${v.visit_id}</td>
      <td>${v.unit_code || "-"}</td>
      <td>${v.visitor_type}</td>
      <td>${formatTime(v.arrived_at)}</td>
      <td>${v.state || "-"}</td>
      <td>
        <button data-id="${v.visit_id}" class="overrideBtn">Override</button>
      </td>
    `;
    tb.appendChild(tr);
  });

  box.innerHTML = "";
  box.appendChild(table);

  box.querySelectorAll(".overrideBtn").forEach(btn => {
    btn.addEventListener("click", onOverride);
  });
}

/* =========================
   Override
========================= */

async function onOverride(e) {
  const visitId = e.target.dataset.id;
  const reason = prompt("เหตุผลในการ Override");

  if (!reason) return;

  try {
    await callAPI("/visit/override", {
      visit_id: visitId,
      reason: reason
    });
    alert("Override สำเร็จ");
  } catch (err) {
    alert("Override ไม่สำเร็จ");
  }
}

/* =========================
   Reports
========================= */

function bindReports() {
  qs("dailyReportBtn")?.addEventListener("click", () => loadReport("daily"));
  qs("stuckReportBtn")?.addEventListener("click", () => loadReport("stuck"));
  qs("exceptionReportBtn")?.addEventListener("click", () => loadReport("exception"));
}

async function loadReport(type) {
  const box = qs("reportResult");
  box.innerHTML = "<p class='muted'>กำลังโหลดรายงาน...</p>";

  try {
    let data = [];
    if (type === "daily") {
      data = await callAPI("/report/daily");
    } else if (type === "stuck") {
      data = await callAPI("/report/stuck");
    } else if (type === "exception") {
      data = await callAPI("/report/exception");
    }

    renderReport(type, data);
  } catch (err) {
    box.innerHTML = "<p class='error'>โหลดรายงานไม่สำเร็จ</p>";
  }
}

function renderReport(type, rows) {
  const box = qs("reportResult");
  if (!rows.length) {
    box.innerHTML = "<p class='muted'>ไม่มีข้อมูล</p>";
    return;
  }

  const pre = document.createElement("pre");
  pre.textContent = JSON.stringify(rows, null, 2);
  box.innerHTML = "";
  box.appendChild(pre);
}

/* =========================
   Helpers
========================= */

function formatTime(t) {
  if (!t) return "-";
  const d = new Date(t);
  return d.toLocaleString("th-TH");
}
