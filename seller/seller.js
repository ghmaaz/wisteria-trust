(async function () {
  const content = document.getElementById("content");

  const params = new URLSearchParams(window.location.search);
  const verificationId = params.get("id");

  if (!verificationId) {
    content.innerHTML =
      "<div class='error'>Invalid seller link. Verification ID missing.</div>";
    return;
  }

  const buyerLink = `https://wisteriatrust.com/?id=${verificationId}`;

  try {
    const res = await fetch(
      `https://wisteria-backend.onrender.com/api/verify/${encodeURIComponent(verificationId)}`
    );

    const data = await res.json();

    if (!res.ok || data.verified === false) {
      let msg = "Verification not found.";

      if (data.status === "REVOKED") msg = "This verification has been revoked.";
      if (data.status === "EXPIRED") msg = "This verification has expired.";

      content.innerHTML = `<div class="error">${msg}</div>`;
      return;
    }

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

      <hr>

      <h3>Buyer Verification Link</h3>
      <input type="text" value="${buyerLink}" readonly style="width:100%;padding:8px">
      <button onclick="copyText('${buyerLink}')">Copy Link</button>

      <hr>

      <h3>Verified Badge</h3>
      <img src="https://wisteriatrust.com/assets/images/wisteria-verified.png"
           alt="Verified Badge"
           style="max-width:180px;display:block;margin-bottom:10px">

      <h3>Website Embed Code</h3>
      <textarea id="embedCode" rows="4" style="width:100%" readonly>
<a href="${buyerLink}" target="_blank">
  <img src="https://wisteriatrust.com/assets/images/wisteria-verified.png"
       alt="Verified Wisteria Seller">
</a>
      </textarea>
      <button onclick="copyEmbed()">Copy Code</button>
    `;
  } catch (error) {
    console.error("Seller page error:", error);
    content.innerHTML =
      "<div class='error'>Unable to load seller verification.</div>";
  }
})();

// 🔹 Copy helpers
function copyText(text) {
  navigator.clipboard.writeText(text);
  alert("Link copied!");
}

function copyEmbed() {
  const code = document.getElementById("embedCode").value;
  navigator.clipboard.writeText(code);
  alert("Embed code copied!");
}
