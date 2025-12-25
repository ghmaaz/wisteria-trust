const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');

menuBtn.onclick = () => {
  menuBtn.classList.toggle('menu-open');
  mobileMenu.classList.toggle('active');
};

document.querySelectorAll('.m-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
    menuBtn.classList.remove('menu-open');
  });
});

/* ===============================
   REAL VERIFICATION CHECK
================================ */
async function verifySeller() {
  const v = document.getElementById('vid').value.trim();   // ✅ FIRST
  const out = document.getElementById('output');

  if (!v) {
    out.innerHTML = "<div class='result error'>Please enter a Verification ID.</div>";
    return;
  }

  out.innerHTML = "<div class='result'>Checking verification...</div>";

  try {
    const res = await fetch(`https://wisteria-backend.onrender.com/api/verify/${v}`);
    const data = await res.json();

      if (!res.ok || data.verified === false) {

      let msg = "❌ This seller is not verified by Wisteria Trust.";

      if (data.status === "REVOKED") {
        msg = "❌ This verification has been revoked by Wisteria Trust.";
      }

      if (data.status === "EXPIRED") {
        msg = "⏰ This verification has expired.";
      }

      out.innerHTML = `<div class="result error">${msg}</div>`;
      return;
    }


    out.innerHTML = `
      <div class="result success">
        ✅ <strong>Seller Verified</strong><br><br>
        <strong>Seller:</strong> ${data.sellerName}<br>
        <strong>Business:</strong> ${data.businessName || "N/A"}<br>
        <strong>Status:</strong> ${data.status}<br>
        <strong>Valid Till:</strong> ${new Date(data.validTill).toDateString()}
      </div>
    `;

  } catch (err) {
    console.error(err);
    out.innerHTML = `
      <div class="result error">
        ⚠️ Unable to verify at the moment. Please try again later.
      </div>
    `;
  }
}

// Auto-fill & auto-verify from URL
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (id) {
    const input = document.getElementById("vid");
    if (input) {
      input.value = id;

      // auto verify
      if (typeof verifySeller === "function") {
        verifySeller();
      }
    }
  }
});
