let ALL_VERIFICATIONS = [];
let EDIT_ID = null;

/* ===============================
   AUTH GUARD
================================ */
const token = localStorage.getItem("adminToken");
if (!token) {
  window.location.href = "login.html";
}

/* ===============================
   LOAD VERIFICATIONS
================================ */
async function loadVerifications() {
  try {
    const res = await fetch(
      "https://wisteria-backend.onrender.com/api/admin/verifications",
      { headers: { Authorization: "Bearer " + token } }
    );

    if (res.status === 401) {
      alert("Session expired. Please login again.");
      localStorage.removeItem("adminToken");
      window.location.href = "login.html";
      return;
    }

    const data = await res.json();
    if (!data.success) return;

    ALL_VERIFICATIONS = data.data;
    renderTable(ALL_VERIFICATIONS);
  } catch (err) {
    console.error("Load failed", err);
  }
}

/* ===============================
   TABLE RENDER
================================ */
function renderTable(list) {
  const tbody = document.getElementById("list");
  tbody.innerHTML = "";

  list.forEach(v => {
    const sellerLink = `https://wisteriatrust.com/?id=${v.verificationId}`;

    let actions = `
      <button onclick="openEdit('${v.verificationId}')">✏️ Edit</button>
      <button onclick="deleteVerification('${v.verificationId}')">🗑 Delete</button>
    `;

    if (v.status === "ACTIVE") {
      actions += `
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
      <td>${v.status}</td>
      <td>${new Date(v.expiryDate).toDateString()}</td>
      <td>${new Date(v.createdAt).toDateString()}</td>
      <td>
        <a href="${sellerLink}" target="_blank">Open</a>
        <button onclick="copyLink('${sellerLink}')">📋</button>
      </td>
      <td>${actions}</td>
    `;
    tbody.appendChild(tr);
  });
}

/* ===============================
   COPY LINK
================================ */
function copyLink(link) {
  navigator.clipboard.writeText(link);
  alert("Seller link copied");
}

/* ===============================
   EDIT
================================ */
function openEdit(id) {
  const v = ALL_VERIFICATIONS.find(x => x.verificationId === id);
  if (!v) return;

  EDIT_ID = id;
  eSeller.value = v.sellerName;
  eBusiness.value = v.businessName;
  eCity.value = v.city;
  eEmail.value = v.email;
  eExpiry.value = v.expiryDate.split("T")[0];

  editModal.style.display = "block";
}

function closeModal() {
  editModal.style.display = "none";
}

async function saveEdit() {
  await fetch(
    `https://wisteria-backend.onrender.com/api/admin/verification/${EDIT_ID}/update`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        sellerName: eSeller.value,
        businessName: eBusiness.value,
        city: eCity.value,
        email: eEmail.value,
        expiryDate: eExpiry.value
      })
    }
  );

  closeModal();
  loadVerifications();
}

/* ===============================
   DELETE
================================ */
async function deleteVerification(id) {
  if (!confirm("Delete permanently?")) return;

  await fetch(
    `https://wisteria-backend.onrender.com/api/admin/verification/${id}`,
    { method: "DELETE", headers: { Authorization: "Bearer " + token } }
  );

  loadVerifications();
}

/* ===============================
   STATUS ACTIONS
================================ */
async function revokeVerification(id) {
  await fetch(
    `https://wisteria-backend.onrender.com/api/admin/verification/${id}/revoke`,
    { method: "PATCH", headers: { Authorization: "Bearer " + token } }
  );
  loadVerifications();
}

async function expireVerification(id) {
  await fetch(
    `https://wisteria-backend.onrender.com/api/admin/verification/${id}/expire`,
    { method: "PATCH", headers: { Authorization: "Bearer " + token } }
  );
  loadVerifications();
}

async function extendExpiry(id) {
  const d = prompt("New expiry (YYYY-MM-DD)");
  if (!d) return;

  await fetch(
    `https://wisteria-backend.onrender.com/api/admin/verification/${id}/extend`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ expiryDate: d })
    }
  );

  loadVerifications();
}

/* ===============================
   INIT
================================ */
loadVerifications();
