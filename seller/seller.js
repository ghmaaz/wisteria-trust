(async function () {
  const content = document.getElementById("content");

  // 🔹 Get ID from URL: /seller/WT-2025-002
  const parts = window.location.pathname.split("/");
  const verificationId = parts[parts.length - 1];

  if (!verificationId) {
    content.innerHTML = "<div class='error'>Invalid seller link</div>";
    return;
  }

  try {
    const res = await fetch(
      `https://wisteria-backend.onrender.com/api/verify/${verificationId}`
    );

    const data = await res.json();

    if (!res.ok || data.verified === false) {
      content.innerHTML = `
        <div class="error">
          Verification not found or not active.
        </div>
      `;
      return;
    }

    content.innerHTML = `
      <p><strong>Verification ID:</strong> ${data.verificationId}</p>
      <p><strong>Seller Name:</strong> ${data.sellerName}</p>
      <p><strong>Business:</strong> ${data.businessName || "N/A"}</p>
      <p><strong>Status:</strong>
        <span class="status ${data.status}">${data.status}</span>
      </p>
      <p><strong>Valid Till:</strong>
        ${new Date(data.validTill).toDateString()}
      </p>
    `;
  } catch (err) {
    content.innerHTML = `
      <div class="error">
        Unable to load seller verification.
      </div>
    `;
  }
})();
