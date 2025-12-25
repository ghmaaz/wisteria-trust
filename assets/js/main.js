/* ===============================
   MOBILE MENU
================================ */
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

if (menuBtn && mobileMenu) {
  menuBtn.onclick = () => {
    menuBtn.classList.toggle("menu-open");
    mobileMenu.classList.toggle("active");
  };

  document.querySelectorAll(".m-link").forEach(link => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("active");
      menuBtn.classList.remove("menu-open");
    });
  });
}

/* ===============================
   HELPER: SCROLL TO VERIFY BOX
================================ */
function scrollToVerifyBox() {
  const box = document.getElementById("verify");
  if (box) {
    box.scrollIntoView({ behavior: "smooth" });
  }
}

/* ===============================
   REAL VERIFICATION CHECK
================================ */
async function verifySeller() {
  const input = document.getElementById("vid");
  const out = document.getElementById("output");

  if (!input || !out) return;

  const v = input.value.trim();

  if (!v) {
    out.innerHTML =
      "<div class='result error'>Please enter a Verification ID.</div>";
    scrollToVerifyBox();
    return;
  }

  out.innerHTML = "<div class='result'>Checking verification...</div>";
  scrollToVerifyBox();

  try {
    const res = await fetch(
      `https://wisteria-backend.onrender.com/api/verify/${encodeURIComponent(v)}`
    );

    const data = await res.json();

    // ❌ NOT VERIFIED / REVOKED / EXPIRED
    if (!res.ok || data.verified === false) {
      let msg = "❌ This seller is not verified by Wisteria Trust.";

      if (data.status === "REVOKED") {
        msg = "❌ This verification has been revoked by Wisteria Trust.";
      }

      if (data.status === "EXPIRED") {
        msg = "⏰ This verification has expired.";
      }

      out.innerHTML = `<div class="result error">${msg}</div>`;
      scrollToVerifyBox();
      return;
    }

    // ✅ VERIFIED
    out.innerHTML = `
      <div class="result success">
        ✅ <strong>Seller Verified</strong><br><br>
        <strong>Seller:</strong> ${data.sellerName}<br>
        <strong>Business:</strong> ${data.businessName || "N/A"}<br>
        <strong>Status:</strong> ${data.status}<br>
        <strong>Valid Till:</strong> ${new Date(
          data.validTill
        ).toDateString()}
      </div>
    `;

    scrollToVerifyBox();
  } catch (err) {
    console.error("Verification error:", err);
    out.innerHTML = `
      <div class="result error">
        ⚠️ Unable to verify at the moment. Please try again later.
      </div>
    `;
    scrollToVerifyBox();
  }
}

/* ===============================
   AUTO-FILL & AUTO-VERIFY (LINK)
================================ */
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (id) {
    const input = document.getElementById("vid");
    if (input) {
      input.value = id.trim();
      verifySeller(); // auto verify + auto scroll
    }
  }
});
