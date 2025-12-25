let ALL_VERIFICATIONS = [];
let EDIT_ID = null;

/* ===============================
   LOAD
================================ */
async function loadVerifications() {
  const token = localStorage.getItem("adminToken");

  const res = await fetch(
    "https://wisteria-backend.onrender.com/api/admin/verifications",
    { headers: { Authorization: "Bearer " + token } }
  );

  const data = await res.json();
  if (!data.success) return;

  ALL_VERIFICATIONS = data.data;
  renderTable(ALL_VERIFICATIONS);
}

/* ===============================
   TABLE
================================ */
function renderTable(list) {
  const tbody = document.getElementById("list");
  tbody.innerHTML = "";

  list.forEach(v => {
    const sellerPage =
      `https://wisteriatrust.com/seller/?id=${v.verificationId}`;

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
        <a href="${sellerPage}" target="_blank">Open</a>
        <button onclick="copyLink('${sellerPage}')">📋</button>
      </td>
      <td>${actions}</td>
    `;
    tbody.appendChild(tr);
  });
}

/* ===============================
   COPY
================================ */
function copyLink(link) {
  navigator.clipboard.writeText(link);
  alert("Seller page link copied");
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
  eExpiry.value = new Date(v.expiryDate).toISOString().split("T")[0];

  editModal.style.display = "block";
}

function closeModal() {
  editModal.style.display = "none";
}

async function saveEdit() {
  const token = localStorage.getItem("adminToken");

  const payload = {
    sellerName: eSeller.value,
    businessName: eBusiness.value,
    city: eCity.value,
    email: eEmail.value,
    expiryDate: eExpiry.value
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
   DELETE (CONFIRM)
================================ */
async function deleteVerification(id) {
  if (!confirm("⚠️ This will permanently delete this verification. Continue?"))
    return;

  const token = localStorage.getItem("adminToken");

  const res = await fetch(
    `https://wisteria-backend.onrender.com/api/admin/verification/${id}`,
    {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token }
    }
  );

  if (!res.ok) {
    alert("Delete failed");
    return;
  }

  alert("Verification deleted");
  loadVerifications();
}

/* ===============================
   REVOKE / EXPIRE / EXTEND
================================ */
async function revokeVerification(id) {
  if (!confirm("Revoke this verification?")) return;
  const token = localStorage.getItem("adminToken");

  await fetch(
    `https://wisteria-backend.onrender.com/api/admin/verification/${id}/revoke`,
    { method: "PATCH", headers: { Authorization: "Bearer " + token } }
  );

  loadVerifications();
}

async function expireVerification(id) {
  if (!confirm("Expire this verification?")) return;
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
if (location.pathname.includes("dashboard")) {
  loadVerifications();
}
