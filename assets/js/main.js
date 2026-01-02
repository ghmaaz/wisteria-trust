// Luxury Navigation Scroll Effect
window.addEventListener("scroll", () => {
  const nav = document.querySelector(".navbar")
  if (window.scrollY > 50) {
    nav.classList.add("scrolled")
  } else {
    nav.classList.remove("scrolled")
  }
})

// Mobile Menu Toggle
const menuBtn = document.getElementById("menuBtn")
const mobileMenu = document.getElementById("mobileMenu")

if (menuBtn && mobileMenu) {
  const toggleMenu = () => {
    menuBtn.classList.toggle("menu-open")
    mobileMenu.classList.toggle("active")
    // Toggle body scroll and ensure menu is fixed properly
    if (mobileMenu.classList.contains("active")) {
      document.body.style.overflow = "hidden"
      mobileMenu.style.display = "flex"
    } else {
      document.body.style.overflow = "auto"
      // Wait for transition before hiding
      setTimeout(() => {
        if (!mobileMenu.classList.contains("active")) {
          mobileMenu.style.display = "none"
        }
      }, 400)
    }
  }

  menuBtn.addEventListener("click", toggleMenu)

  document.querySelectorAll(".mobile-link").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("active")
      menuBtn.classList.remove("menu-open")
      document.body.style.overflow = "auto"
    })
  })
}

const themeToggle = document.getElementById("themeToggle")
const body = document.body

const savedTheme = localStorage.getItem("theme") || "light-theme"
body.className = savedTheme

if (themeToggle) {
  themeToggle.onclick = () => {
    if (body.classList.contains("light-theme")) {
      body.classList.replace("light-theme", "dark-theme")
      localStorage.setItem("theme", "dark-theme")
    } else {
      body.classList.replace("dark-theme", "light-theme")
      localStorage.setItem("theme", "light-theme")
    }
  }
}

document.querySelectorAll(".contact-trigger").forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    e.preventDefault()
    const footer = document.querySelector("#footer")
    if (footer) {
      footer.scrollIntoView({ behavior: "smooth" })
    }
  })
})

/* ===============================
   HELPER: SCROLL TO VERIFY BOX
================================ */
function scrollToVerifyBox() {
  const box = document.getElementById("verify")
  if (box) {
    box.scrollIntoView({ behavior: "smooth" })
  }
}

// Real Verification Check
/* ===============================
   REAL VERIFICATION CHECK
================================ */
async function verifySeller() {
  const input = document.getElementById("vid")
  const out = document.getElementById("output")

  if (!input || !out) return

  const v = input.value.trim()

  if (!v) {
    out.innerHTML = "<div class='result error'>Please enter a Verification ID.</div>"
    scrollToVerifyBox()
    return
  }

  out.innerHTML = `
    <div class="verification-report" style="text-align:center;">
      <div class="status-badge" style="margin: 0 auto 20px; width: fit-content;">
        <i data-lucide="loader-2" class="animate-spin"></i> Initializing Security Scan...
      </div>
      <p style="color: var(--text-muted);">Retrieving official records from registry...</p>
    </div>
  `
  window.lucide.createIcons() // Declare lucide variable before using it
  scrollToVerifyBox()

  try {
    const res = await fetch(`https://wisteria-backend.onrender.com/api/verify/${encodeURIComponent(v)}`)
    const data = await res.json()

    // ❌ NOT VERIFIED / REVOKED / EXPIRED
    if (!res.ok || data.verified === false) {
      const icon = "shield-alert"
      const statusClass = "revoked"
      let msg = "Not Verified"
      let detail = "This entity has no active record in our sovereign registry."

      if (data.status === "REVOKED") {
        msg = "Revoked"
        detail = "This verification has been officially revoked due to compliance failure."
      }

      if (data.status === "EXPIRED") {
        msg = "Expired"
        detail = "The verification period for this entity has lapsed."
      }

      out.innerHTML = `
        <div class="verification-report">
          <div class="report-header">
            <div class="status-badge ${statusClass}">
              <i data-lucide="${icon}"></i> ${msg}
            </div>
            <span style="font-size: 0.65rem; color: var(--text-muted); font-weight: 700;">WTID: ${v}</span>
          </div>
          <p style="color: var(--text-main); font-weight: 500;">${detail}</p>
        </div>
      `
      window.lucide.createIcons() // Declare lucide variable before using it
      scrollToVerifyBox()
      return
    }

    // ✅ VERIFIED - Professional Report Card
    out.innerHTML = `
      <div class="verification-report">
        <div class="report-seal">WISTERIA</div>
        <div class="report-header">
          <div class="status-badge verified">
            <i data-lucide="shield-check"></i> Seller Verified
          </div>
          <span style="font-size: 0.65rem; color: var(--text-muted); font-weight: 700;">WTID: ${v}</span>
        </div>
        
        <div class="report-grid">
          <div class="report-item">
            <label>Authorized Entity</label>
            <div class="value">${data.sellerName}</div>
          </div>
          <div class="report-item">
            <label>Institutional Role</label>
            <div class="value">${data.businessName || "Registered Member"}</div>
          </div>
          <div class="report-item">
            <label>Protocol Status</label>
            <div class="value" style="color: #10b981;">${data.status}</div>
          </div>
          <div class="report-item">
            <label>Issuance Period</label>
            <div class="value">Valid Until ${new Date(data.validTill).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</div>
          </div>
        </div>

        <div class="report-footer">
          <i data-lucide="info" style="width: 14px; height: 14px;"></i>
          <span>This document serves as an official confirmation of institutional legitimacy within the Wisteria Trust sovereign registry.</span>
        </div>
      </div>
    `
    window.lucide.createIcons() // Declare lucide variable before using it
    scrollToVerifyBox()
  } catch (err) {
    console.error("Verification error:", err)
    out.innerHTML = `
      <div class="verification-report revoked">
        <i data-lucide="alert-triangle"></i> Registry Connection Error. Please try again later.
      </div>
    `
    window.lucide.createIcons() // Declare lucide variable before using it
    scrollToVerifyBox()
  }
}

// Auto-Fill & Auto-Verify (LINK)
/* ===============================
   AUTO-FILL & AUTO-VERIFY (LINK)
================================ */
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search)
  const id = params.get("id")

  if (id) {
    const input = document.getElementById("vid")
    if (input) {
      input.value = id.trim()
      verifySeller() // auto verify + auto scroll
    }
  }

  // Existing AOS init
  const AOS = window.AOS // Example declaration
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    })
  }
})
