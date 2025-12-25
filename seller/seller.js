const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const statusEl = document.getElementById("status");
const sellerName = document.getElementById("sellerName");
const businessName = document.getElementById("businessName");
const city = document.getElementById("city");
const vid = document.getElementById("vid");
const validTill = document.getElementById("validTill");

const copyLinkBtn = document.getElementById("copyLink");
const copyCodeBtn = document.getElementById("copyCode");
const embedCode = document.getElementById("embedCode");

if (!id) {
  statusEl.textContent = "Invalid link";
  statusEl.className = "status REVOKED";
  throw new Error("No ID in URL");
}

fetch(`https://wisteria-backend.onrender.com/api/verify/${id}`)
  .then(res => res.json())
  .then(data => {

    if (!data.verified) {
      statusEl.textContent = data.status || "NOT VERIFIED";
      statusEl.className = `status ${data.status || "REVOKED"}`;
      return;
    }

    statusEl.textContent = data.status;
    statusEl.className = `status ${data.status}`;

    sellerName.textContent = data.sellerName;
    businessName.textContent = data.businessName || "—";
    city.textContent = data.city || "—";
    vid.textContent = data.verificationId;
    validTill.textContent = new Date(data.validTill).toDateString();

    const link = `https://wisteriatrust.com/seller/?id=${data.verificationId}`;

    embedCode.textContent = `<a href="${link}" target="_blank">
  <img src="https://wisteriatrust.com/seller/badge.png"
       alt="Verified by Wisteria Trust"
       width="140">
</a>`;

    copyLinkBtn.onclick = () => {
      navigator.clipboard.writeText(link);
      copyLinkBtn.textContent = "Copied ✓";
      setTimeout(() => copyLinkBtn.textContent = "Copy Verification Link", 1500);
    };

    copyCodeBtn.onclick = () => {
      navigator.clipboard.writeText(embedCode.textContent);
      copyCodeBtn.textContent = "Copied ✓";
      setTimeout(() => copyCodeBtn.textContent = "Copy Website Code", 1500);
    };

  })
  .catch(() => {
    statusEl.textContent = "Error loading verification";
    statusEl.className = "status REVOKED";
  });
