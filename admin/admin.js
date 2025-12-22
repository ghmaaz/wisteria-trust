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
  const res = await fetch("https://wisteria-backend.onrender.com/api/admin/verifications", {
    headers: { Authorization: "Bearer " + token }
  });

  const data = await res.json();
  console.log("API RESPONSE:", data);
  if (!data.success) return;

  const tbody = document.getElementById("list");
  tbody.innerHTML = "";

  data.data.forEach(v => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${v.verificationId}</td>
      <td>${v.sellerName}</td>
      <td>${v.status}</td>
      <td>${new Date(v.expiryDate).toDateString()}</td>
    `;
    tbody.appendChild(tr);
  });
}
// Dashboard page par ho to list load karo
if (window.location.pathname.includes("dashboard")) {
  loadVerifications();
}




