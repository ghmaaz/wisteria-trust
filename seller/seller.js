document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search)
  const id = params.get("id")

  const vid = document.getElementById("vid")
  const sellerName = document.getElementById("sellerName")
  const businessName = document.getElementById("businessName")
  const statusEl = document.getElementById("status")
  const validTill = document.getElementById("validTill")

  const verifyLinkEl = document.getElementById("verifyLink")
  const embedCodeEl = document.getElementById("embedCode")

  const copyLinkBtn = document.getElementById("copyLink")
  const copyCodeBtn = document.getElementById("copyCode")

  if (!id) {
    verifyLinkEl.textContent = "Error: Invalid Verification Protocol"
    return
  }

  // ✅ Maintain original link structure
  const verificationLink = `https://wisteriatrust.com/?id=${id}`
  verifyLinkEl.textContent = verificationLink

  // ✅ Maintain original embed structure
  const badgeHtml = `<a href="${verificationLink}" target="_blank">
  <img src="https://wisteriatrust.com/seller/badge.png" 
       alt="Verified by Wisteria Trust" 
       width="140">
</a>`
  embedCodeEl.textContent = badgeHtml

  // Clipboard functionality
  const copyToClipboard = async (text, btn) => {
    try {
      await navigator.clipboard.writeText(text)
      const originalText = btn.querySelector("span").textContent
      btn.querySelector("span").textContent = "Copied to Clipboard"

      setTimeout(() => {
        btn.querySelector("span").textContent = originalText
      }, 1500)
    } catch (err) {
      console.error("[v0] Copy failed:", err)
    }
  }

  copyLinkBtn.onclick = () => copyToClipboard(verificationLink, copyLinkBtn)
  copyCodeBtn.onclick = () => copyToClipboard(badgeHtml, copyCodeBtn)

  // Fetch Seller Data from backend
  fetch(`https://wisteria-backend.onrender.com/api/verify/${id}`)
    .then((res) => res.json())
    .then((data) => {
      vid.textContent = `Verification ID: ${id}`
      sellerName.textContent = data.sellerName || "—"
      businessName.textContent = data.businessName || "Authorized Sovereign Entity"
      statusEl.textContent = data.status || "ACTIVE"

      if (data.validTill) {
        validTill.textContent = new Date(data.validTill).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      }
    })
    .catch((err) => {
      console.error("[v0] Fetch error:", err)
      statusEl.textContent = "Offline"
    })
})
