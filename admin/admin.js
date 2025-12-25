/* ===============================
   ADMIN LOGIN
================================ */
let ALL_VERIFICATIONS = [];
let EDIT_ID = null;

async function adminLogin() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("msg");

  msg.innerText = "";

  try {
    const res = await fetch(
      "https://wisteria-backend.onrender.com/api/admin/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      }
    );

    const data = await res.json();

    if (!res.ok) {
      msg.innerText = data.message || "Login failed";
      return;
    }

    localStorage.setItem("adminToken", data.token);
    window.location.href = "dashboard.html";
  } catch {
    msg.innerText = "Server error";
  }
}

/* ===============================
   PROTECT DASHBOARD
================================ */
if (window.location.pathname.includes("dashboard")) {
  const token = localStorage.getItem("adminToken");
  if (!token) window.location.href = "login.html";
}

/* ===============================
   LOGOUT
================================ */
function logout() {
  localStorage.removeItem("adminToken");
  window.location.href = "login.html";
}

/* ===============================
   CREATE VERIFICATION
================================ */
async function createVerification() {
  const token = localStorage.getItem("adminToken");
  const msg = document.getElementById("msg");

  const payload = {
    sellerName: document.getElementById("sellerName").value.trim(),
    businessName: document.getElementById("businessName").value.trim(),
    email: document.getElementById("email").value.trim(),
    city: document.getElementById("city").value.trim(),
    expiryDate: document.getElementById("expiryDate").value
  };

  msg.innerText = "";

  try {
    const res = await fetch(
      "https://wisteria-backend.onrender.com/api/admin/verification",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await res.json();

    if (!res.ok) {
      msg.className = "msg error";
      msg.innerText = data.message || "Failed";
      return;
    }

    msg.className = "msg success";
    msg.innerText = "✅ Verification created successfully!";
    loadVerifications();
  } catch {
    msg.className = "msg error";
    msg.innerText = "Server error";
  }
}

/* ===============================
   LOAD VERIFICATIONS
================================ */
async function loadVerifications() {
  const token = localStorage.getItem("adminToken");

  try {
    const res = await fetch(
      "https://wisteria-backend.onrender.com/api/admin/verifications",
      { headers: { Authorization: "Bearer " + token } }
    );

    const data = await res.json();
    if (!data.success) return;

    ALL_VERIFICATIONS = data.data;
    renderTable(ALL_VERIFICATIONS);
  } catch (err) {
    console.error("Load error", err);
  }
}

/* ===============================
   FILTERS
================================ */
function applyFilters() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const status = document.getElementById("statusFilter").value;

  const filtered = ALL_VERIFICATIONS.filter(v => {
    const matchSearch =
      v.verificationId.toLowerCase().includes(search) ||
      v.sellerName.toLowerCase().includes(search);

    const matchStatus = status === "ALL" || v.status === status;
    return matchSearch && matchStatus;
  });

  renderTable(filtered);
}

/* ===============================
   TABLE RENDER
================================ */
function renderTable(list) {
  const tbody = document.getElementById("list");
  tbody.innerHTML = "";

  list.forEach(v => {
    const sellerPage =
      `https://wisteriatrust.com/seller/?id=${v.verificationId}`;

    let actions = "-";
    if (v.status === "ACTIVE") {
      actions = `
        <button onclick="revokeVerification('${v.verificationId}')">Revoke</button>
        <button onclick="expireVerification('${v.verificationId}')">Expire</button>
        <button onclick="extendExpiry('${v.verificationId}')">Extend</button>
      `;
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${v.verificationId}</td>
      <td>${v.sellerName}</td>
      <td>${v.businessName}</td>
      <td>${v.city}</td>
      <td>${v.email}</td>
      <td><span class="status ${v.status}">${v.status}</span></td>
      <td>${new Date(v.expiryDate).toDateString()}</td>
      <td>${new Date(v.createdAt).toDateString()}</td>
      <td>
        <a href="${sellerPage}" target="_blank">Open</a>
        <button onclick="copyLink('${sellerPage}')">📋</button>
      </td>
      <td>
        <button onclick="openEdit('${v.verificationId}')">✏️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* ===============================
   COPY SELLER PAGE LINK
================================ */
function copyLink(link) {
  navigator.clipboard.writeText(link);
  alert("Seller page link copied");
}

/* ===============================
   EDIT MODAL
================================ */
function openEdit(id) {
  const v = ALL_VERIFICATIONS.find(x => x.verificationId === id);
  if (!v) return;

  EDIT_ID = id;

  document.getElementById("eSeller").value = v.sellerName;
  document.getElementById("eBusiness").value = v.businessName;
  document.getElementById("eCity").value = v.city;
  document.getElementById("eEmail").value = v.email;
  document.getElementById("eExpiry").value =
    new Date(v.expiryDate).toISOString().split("T")[0];

  document.getElementById("editModal").style.display = "block";
}

function closeModal() {
  document.getElementById("editModal").style.display = "none";
}

async function saveEdit() {
  const token = localStorage.getItem("adminToken");

  const payload = {
    sellerName: document.getElementById("eSeller").value,
    businessName: document.getElementById("eBusiness").value,
    city: document.getElementById("eCity").value,
    email: document.getElementById("eEmail").value,
    expiryDate: document.getElementById("eExpiry").value
  };

  await fetch(
    `https://wisteria-backend.onrender.com/api/admin/verification/${EDIT_ID}/update`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify(payload)
    }
  );

  closeModal();
  loadVerifications();
}

/* ===============================
   REVOKE / EXPIRE / EXTEND
================================ */
async function revokeVerification(id) {
  if (!confirm("Revoke verification?")) return;
  const token = localStorage.getItem("adminToken");

  await fetch(
    `https://wisteria-backend.onrender.com/api/admin/verification/${id}/revoke`,
    { method: "PATCH", headers: { Authorization: "Bearer " + token } }
  );

  loadVerifications();
}

async function expireVerification(id) {
  if (!confirm("Expire verification?")) return;
  const token = localStorage.getItem("adminToken");

  await fetch(
    `https://wisteria-backend.onrender.com/api/admin/verification/${id}/expire`,
    { method: "PATCH", headers: { Authorization: "Bearer " + token } }
  );

  loadVerifications();
}

async function extendExpiry(id) {
  const newDate = prompt("Enter new expiry date (YYYY-MM-DD):");
  if (!newDate) return;

  const token = localStorage.getItem("adminToken");

  await fetch(
    `https://wisteria-backend.onrender.com/api/admin/verification/${id}/extend`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ expiryDate: newDate })
    }
  );

  loadVerifications();
}

/* ===============================
   AUTO LOAD
================================ */
if (window.location.pathname.includes("dashboard")) {
  loadVerifications();
}
