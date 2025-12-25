(async function () {
  const content = document.getElementById("content");

  // 🔹 Get verification ID from query string
  // Example: /seller/?id=WT-2025-002
  const params = new URLSearchParams(window.location.search);
  const verificationId = params.get("id");

  if (!verificationId) {
    content.innerHTML =
      "<div class='error'>Invalid seller link. Verification ID missing.</div>";
    return;
  }

  try {
    const apiUrl =
      `https://wisteria-backend.onrender.com/api/verify/${encodeURIComponent(verificationId)}`;

    const res = await fetch(apiUrl);
    const data = await res.json();

    // ❌ Not verified / revoked / expired
    if (!res.ok || data.verified === false) {
      let msg = "Verification not found.";

      if (data.status === "REVOKED") {
        msg = "This verification has been revoked.";
      }

      if (data.status === "EXPIRED") {
        msg = "This verification has expired.";
      }

      content.innerHTML = `<div class="error">${msg}</div>`;
      return;
    }

    // ✅ Verified
    content.innerHTML = `
      <div class="row"><strong>Verification ID:</strong> ${data.verificationId}</div>
      <div class="row"><strong>Seller Name:</strong> ${data.sellerName}</div>
      <div class="row"><strong>Business Name:</strong> ${data.businessName || "N/A"}</div>
      <div class="row"><strong>Status:</strong>
        <span class="status ${data.status}">${data.status}</span>
      </div>
      <div class="row"><strong>Valid Till:</strong>
        ${new Date(data.validTill).toDateString()}
      </div>
    `;
  } catch (error) {
    console.error("Seller page error:", error);
    content.innerHTML =
      "<div class='error'>Unable to load seller verification.</div>";
  }
})();
