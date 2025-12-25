const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const vid = document.getElementById("vid");
const sellerName = document.getElementById("sellerName");
const businessName = document.getElementById("businessName");
const statusEl = document.getElementById("status");
const validTill = document.getElementById("validTill");

const verifyLinkEl = document.getElementById("verifyLink");
const embedCodeEl = document.getElementById("embedCode");

const copyLinkBtn = document.getElementById("copyLink");
const copyCodeBtn = document.getElementById("copyCode");

if (!id) {
  verifyLinkEl.textContent = "Invalid verification link";
  throw new Error("Missing ID");
}

// ✅ MAIN VERIFICATION PAGE LINK (IMPORTANT)
const verificationLink = `https://wisteriatrust.com/?id=${id}`;

verifyLinkEl.textContent = verificationLink;

// Embed code (badge → main verification page)
embedCodeEl.textContent = `<a href="${verificationLink}" target="_blank">
  <img src="https://wisteriatrust.com/seller/badge.png"
       alt="Verified by Wisteria Trust"
       width="140">
</a>`;

copyLinkBtn.onclick = () => {
  navigator.clipboard.writeText(verificationLink);
  copyLinkBtn.textContent = "Copied ✓";
  setTimeout(() => copyLinkBtn.textContent = "Copy Verification Link", 1500);
};

copyCodeBtn.onclick = () => {
  navigator.clipboard.writeText(embedCodeEl.textContent);
  copyCodeBtn.textContent = "Copied ✓";
  setTimeout(() => copyCodeBtn.textContent = "Copy Website Code", 1500);
};

// Fetch seller info (display only)
fetch(`https://wisteria-backend.onrender.com/api/verify/${id}`)
  .then(res => res.json())
  .then(data => {
    vid.textContent = id;
    sellerName.textContent = data.sellerName || "—";
    businessName.textContent = data.businessName || "—";
    statusEl.textContent = data.status || "—";

    if (data.validTill) {
      validTill.textContent = new Date(data.validTill).toDateString();
    }
  })
  .catch(() => {
    statusEl.textContent = "Unavailable";
  });
