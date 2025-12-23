async function adminLogin() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("msg");

  msg.innerText = "";

  try {
    const res = await fetch("https://wisteria-backend.onrender.com/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      msg.innerText = data.message || "Login failed";
      return;
    }

    // ✅ Save token
    localStorage.setItem("adminToken", data.token);

    // ➡ Redirect
    window.location.href = "dashboard.html";

  } catch (err) {
    msg.innerText = "Server error";
  }
}

// 🔐 Protect dashboard
if (window.location.pathname.includes("dashboard")) {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    window.location.href = "login.html";
  }
}

// 🚪 Logout
function logout() {
  localStorage.removeItem("adminToken");
  window.location.href = "login.html";
}

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
    const res = await fetch("https://wisteria-backend.onrender.com/api/admin/verification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      msg.className = "msg error";
      msg.innerText = data.message || "Failed to create verification";
      return;
    }

    msg.className = "msg success";
    msg.innerText = "✅ Verification created successfully!";

  } catch (err) {
    msg.className = "msg error";
    msg.innerText = "Server error";
  }
}

async function loadVerifications() {
  const token = localStorage.getItem("adminToken");

  const res = await fetch(
    "https://wisteria-backend.onrender.com/api/admin/verifications",
    {
      headers: { Authorization: "Bearer " + token }
    }
  );

  const data = await res.json();
  if (!data.success) return;

  const tbody = document.getElementById("list");
  tbody.innerHTML = "";

  data.data.forEach(v => {
    let actions = "-";

    if (v.status === "ACTIVE") {
      actions = `
        <button onclick="revokeVerification('${v.verificationId}')">Revoke</button>
        <button onclick="expireVerification('${v.verificationId}')">Expire</button>
      `;
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${v.verificationId}</td>
      <td>${v.sellerName}</td>
      <td>${v.status}</td>
      <td>${new Date(v.expiryDate).toDateString()}</td>
      <td>${actions}</td>
    `;

    tbody.appendChild(tr);
  });
}

async function revokeVerification(id) {
  if (!confirm("Are you sure you want to revoke this verification?")) return;

  const token = localStorage.getItem("adminToken");

  const res = await fetch(
    `https://wisteria-backend.onrender.com/api/admin/verification/${id}/revoke`,
    {
      method: "PATCH",
      headers: {
        Authorization: "Bearer " + token
      }
    }
  );

  if (!res.ok) {
    alert("Failed to revoke verification");
    return;
  }

  alert("Verification revoked");
  loadVerifications();
}
async function expireVerification(id) {
  if (!confirm("Are you sure you want to expire this verification?")) return;

  const token = localStorage.getItem("adminToken");

  const res = await fetch(
    `https://wisteria-backend.onrender.com/api/admin/verification/${id}/expire`,
    {
      method: "PATCH",
      headers: {
        Authorization: "Bearer " + token
      }
    }
  );

  if (!res.ok) {
    alert("Failed to expire verification");
    return;
  }

  alert("Verification expired");
  loadVerifications();
}
