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
    // Check if it's an internal link
    if (anchor.getAttribute("href").startsWith("#")) {
      e.preventDefault()
      const targetId = anchor.getAttribute("href")
      const targetElement = document.querySelector(targetId)
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" })
      }

      // Close mobile menu if open
      if (mobileMenu && mobileMenu.classList.contains("active")) {
        mobileMenu.classList.remove("active")
        if (menuBtn) menuBtn.classList.remove("menu-open")
        document.body.style.overflow = "auto"
      }
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
      <div class="status-badge" style="margin: 0 auto 20px; width: fit-content; background: var(--bg-elevated);">
        <i data-lucide="loader-2" class="animate-spin"></i> Initializing Security Scan...
      </div>
      <p style="font-size: 0.85rem; color: var(--text-muted);">Retrieving official records from sovereign registry...</p>
    </div>
  `
  window.lucide.createIcons()
  scrollToVerifyBox()

  try {
    const res = await fetch(`https://wisteria-backend.onrender.com/api/verify/${encodeURIComponent(v)}`)
    const data = await res.json()

    // ❌ NOT VERIFIED / REVOKED / EXPIRED
    if (!res.ok || data.verified === false) {
      const icon = "shield-alert"
      const statusClass = "revoked"
      let msg = "Not Verified"

      if (data.status === "REVOKED") msg = "Revoked"
      if (data.status === "EXPIRED") msg = "Expired"

      out.innerHTML = `
        <div class="verification-report revoked">
          <div class="report-header" style="border-bottom: none; margin-bottom: 0;">
            <div class="status-badge revoked">
              <i data-lucide="${icon}"></i> ${msg}
            </div>
            <div style="text-align: right;">
              <div style="font-size: 0.6rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;">Record Ref</div>
              <div style="font-size: 0.9rem; color: var(--text-main); font-weight: 700;">${v}</div>
            </div>
          </div>
        </div>
      `
      window.lucide.createIcons()
      scrollToVerifyBox()
      return
    }

    // ✅ VERIFIED - Professional Compact Certificate
    out.innerHTML = `
      <div class="verification-report">
        <div class="report-seal">CERTIFIED</div>
        <div class="report-header">
          <div class="status-badge verified">
            <i data-lucide="shield-check"></i> Institutional Integrity Verified
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.6rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;">Registry ID</div>
            <div style="font-size: 0.95rem; color: var(--text-main); font-weight: 700;">${v}</div>
          </div>
        </div>
        
        <div class="report-grid">
          <div class="report-item">
            <label>Legal Entity</label>
            <div class="value">${data.sellerName}</div>
          </div>
          <div class="report-item">
            <label>Protocol Status</label>
            <div class="value" style="color: #059669; display: flex; align-items: center; gap: 8px;">
              <span style="width: 8px; height: 8px; background: #059669; border-radius: 50%;"></span>
              Active
            </div>
          </div>
          <div class="report-item">
            <label>Authorized Member</label>
            <div class="value">${data.businessName || "Wisteria Principal"}</div>
          </div>
          <div class="report-item">
            <label>Issuance Period</label>
            <div class="value">Valid Until ${new Date(data.validTill).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</div>
          </div>
        </div>

        <div class="report-footer">
          <i data-lucide="award" style="width: 20px; height: 20px; color: var(--primary); flex-shrink: 0;"></i>
          <span>This document serves as an official confirmation of institutional legitimacy within the Wisteria Trust sovereign registry.</span>
        </div>
      </div>
    `
    window.lucide.createIcons()
    scrollToVerifyBox()
  } catch (err) {
    console.error("Verification error:", err)
    out.innerHTML = `
      <div class="verification-report revoked" style="text-align: center;">
        <i data-lucide="alert-triangle" style="margin-bottom: 12px; color: #dc2626;"></i>
        <div style="font-weight: 600;">Registry Connection Error</div>
        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Please check your connection and try again later.</div>
      </div>
    `
    window.lucide.createIcons()
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
