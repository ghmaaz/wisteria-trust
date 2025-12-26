console.log("ADMIN DASHBOARD JS LOADED");

const token = localStorage.getItem("adminToken");
if (!token) {
  window.location.href = "login.html";
}

async function loadVerifications() {
  try {
    const res = await fetch(
      "https://wisteria-backend.onrender.com/api/admin/verifications",
      {
        headers: {
          Authorization: "Bearer " + token
        }
      }
    );

    if (res.status === 401) {
      alert("Session expired. Login again.");
      localStorage.clear();
      window.location.href = "login.html";
      return;
    }

    const data = await res.json();
    console.log("API RESPONSE:", data);

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
  } catch (err) {
    console.error("Dashboard error:", err);
  }
}

loadVerifications();
