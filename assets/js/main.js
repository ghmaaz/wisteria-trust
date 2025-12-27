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
  menuBtn.onclick = () => {
    menuBtn.classList.toggle("menu-open")
    mobileMenu.classList.toggle("active")
    // Prevent scrolling when menu is open
    document.body.style.overflow = mobileMenu.classList.contains("active") ? "hidden" : "auto"
  }

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

// Check for saved theme or default to dark
const savedTheme = localStorage.getItem("theme") || "dark-theme"
body.className = savedTheme

if (themeToggle) {
  themeToggle.onclick = () => {
    if (body.classList.contains("dark-theme")) {
      body.classList.replace("dark-theme", "light-theme")
      localStorage.setItem("theme", "light-theme")
    } else {
      body.classList.replace("light-theme", "dark-theme")
      localStorage.setItem("theme", "dark-theme")
    }
  }
}

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

  out.innerHTML = "<div class='result'>Checking verification...</div>"
  scrollToVerifyBox()

  try {
    const res = await fetch(`https://wisteria-backend.onrender.com/api/verify/${encodeURIComponent(v)}`)

    const data = await res.json()

    // ❌ NOT VERIFIED / REVOKED / EXPIRED
    if (!res.ok || data.verified === false) {
      let msg = "❌ This seller is not verified by Wisteria Trust."

      if (data.status === "REVOKED") {
        msg = "❌ This verification has been revoked by Wisteria Trust."
      }

      if (data.status === "EXPIRED") {
        msg = "⏰ This verification has expired."
      }

      out.innerHTML = `<div class="result error">${msg}</div>`
      scrollToVerifyBox()
      return
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
    `

    scrollToVerifyBox()
  } catch (err) {
    console.error("Verification error:", err)
    out.innerHTML = `
      <div class="result error">
        ⚠️ Unable to verify at the moment. Please try again later.
      </div>
    `
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
