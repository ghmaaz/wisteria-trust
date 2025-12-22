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
 const res = await fetch(`https://wisteria-backend.onrender.com/api/verify/${v}`);
  const out = document.getElementById('output');

  if (!v) {
    out.innerHTML = "<div class='result error'>Please enter a Verification ID.</div>";
    return;
  }

  out.innerHTML = "<div class='result'>Checking verification...</div>";

  try {
    const res = await fetch(`https://wisteriatrust.com/api/verify/${v}`);
    const data = await res.json();

    if (!res.ok || data.verified === false) {
      out.innerHTML = `
        <div class="result error">
          ❌ This seller is not verified by Wisteria Trust.
        </div>
      `;
      return;
    }

    // ✅ VERIFIED
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

