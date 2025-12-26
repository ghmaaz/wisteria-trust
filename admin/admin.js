/* ===============================
   GLOBAL STATE
================================ */
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
  const payload = {
    sellerName: sellerName.value.trim(),
    businessName: businessName.value.trim(),
    email: email.value.trim(),
    city: city.value.trim(),
    expiryDate: expiryDate.value
  };

  if (
    !payload.sellerName ||
    !payload.businessName ||
    !payload.email ||
    !payload.city ||
    !payload.expiryDate
  ) {
    alert("❌ All fields are required");
    return;
  }

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
      alert(data.message || "Failed to create verification");
      return;
    }

    alert("✅ Verification created successfully");

    // reset form
    sellerName.value = "";
    businessName.value = "";
    email.value = "";
    city.value = "";
    expiryDate.value = "";

    loadVerifications();
  } catch (err) {
    console.error(err);
    alert("Server error");
  }
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
      logout();
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
    const sellerLink =
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
      <td><span class="status ${v.status}">${v.status}</span></td>
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
  alert("✅ Seller page link copied");
}

/* ===============================
   EDIT MODAL
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
  try {
    const res = await fetch(
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

    if (!res.ok) {
      alert("Update failed");
      return;
    }

    closeModal();
    loadVerifications();
  } catch (err) {
    console.error(err);
    alert("Update error");
  }
}

/* ===============================
   DELETE
================================ */
async function deleteVerification(id) {
  if (!confirm("⚠️ This will permanently delete this verification. Continue?"))
    return;

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

  alert("✅ Verification deleted");
  loadVerifications();
}

/* ===============================
   STATUS ACTIONS
================================ */
async function revokeVerification(id) {
  if (!confirm("Revoke this verification?")) return;

  await fetch(
    `https://wisteria-backend.onrender.com/api/admin/verification/${id}/revoke`,
    { method: "PATCH", headers: { Authorization: "Bearer " + token } }
  );

  loadVerifications();
}

async function expireVerification(id) {
  if (!confirm("Expire this verification?")) return;

  await fetch(
    `https://wisteria-backend.onrender.com/api/admin/verification/${id}/expire`,
    { method: "PATCH", headers: { Authorization: "Bearer " + token } }
  );

  loadVerifications();
}

async function extendExpiry(id) {
  const d = prompt("Enter new expiry date (YYYY-MM-DD)");
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
