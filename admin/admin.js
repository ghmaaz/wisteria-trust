/* ===============================
   GLOBAL STATE
================================ */
let ALL_VERIFICATIONS = []
let EDIT_ID = null
const SELECTED_IDS = new Set()
const API_BASE_URL = "https://wisteria-backend.onrender.com"

/* ===============================
   AUTH GUARD
================================ */
const token = localStorage.getItem("adminToken")
if (!token) {
  window.location.href = "login.html"
}

/* ===============================
   THEME INITIALIZATION
================================ */
const currentTheme = localStorage.getItem("theme") || "light"
document.documentElement.setAttribute("data-theme", currentTheme)

/* ===============================
   DOM LOADED
================================ */
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtns = document.querySelectorAll(".btn-logout")
  logoutBtns.forEach((btn) => {
    btn.addEventListener("click", logout)
  })

  const createForm = document.querySelector(".create-form")
  if (createForm) {
    createForm.addEventListener("submit", createVerification)
  }

  const editForm = document.querySelector(".modal-form")
  if (editForm) {
    editForm.addEventListener("submit", (e) => {
      e.preventDefault()
      saveEdit()
    })
  }

  const searchInput = document.getElementById("searchInput")
  const statusFilter = document.getElementById("statusFilter")
  const dateFilter = document.getElementById("dateFilter")

  if (searchInput) {
    searchInput.addEventListener("input", filterTable)
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", filterTable)
  }

  if (dateFilter) {
    dateFilter.addEventListener("change", filterTable)
  }

  const selectAllCheckbox = document.getElementById("selectAll")
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("change", toggleSelectAll)
  }

  const bulkDeleteBtn = document.getElementById("bulkDeleteBtn")
  const bulkRevokeBtn = document.getElementById("bulkRevokeBtn")
  const exportBtn = document.getElementById("exportBtn")

  if (bulkDeleteBtn) {
    bulkDeleteBtn.addEventListener("click", bulkDelete)
  }

  if (bulkRevokeBtn) {
    bulkRevokeBtn.addEventListener("click", bulkRevoke)
  }

  if (exportBtn) {
    exportBtn.addEventListener("click", exportToCSV)
  }

  const themeToggle = document.getElementById("themeToggle")
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const theme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"
      document.documentElement.setAttribute("data-theme", theme)
      localStorage.setItem("theme", theme)
    })
  }

  // Load verifications if on dashboard
  if (document.getElementById("verificationsTable")) {
    loadVerifications()
  }
})

function logout() {
  localStorage.removeItem("adminToken")
  localStorage.removeItem("adminInfo")
  window.location.href = "login.html"
}

/* ===============================
   CREATE VERIFICATION
================================ */
async function createVerification(e) {
  e.preventDefault()

  const sellerName = document.getElementById("sellerName")
  const businessName = document.getElementById("businessName")
  const email = document.getElementById("email")
  const city = document.getElementById("city")
  const expiryDate = document.getElementById("expiryDate")

  const payload = {
    sellerName: sellerName.value.trim(),
    businessName: businessName.value.trim(),
    email: email.value.trim(),
    city: city.value.trim(),
    expiryDate: expiryDate.value,
  }

  if (!payload.sellerName || !payload.businessName || !payload.email || !payload.city || !payload.expiryDate) {
    alert("All fields are required")
    return
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.message || "Failed to create verification")
      return
    }

    alert("Verification created successfully!")

    sellerName.value = ""
    businessName.value = ""
    email.value = ""
    city.value = ""
    expiryDate.value = ""

    setTimeout(() => {
      window.location.href = "dashboard.html"
    }, 1000)
  } catch (err) {
    console.error(err)
    alert("Server error. Please try again.")
  }
}

/* ===============================
   LOAD VERIFICATIONS
================================ */
async function loadVerifications() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/verifications`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (res.status === 401) {
      alert("Session expired. Please login again.")
      logout()
      return
    }

    const data = await res.json()

    if (data.success && data.data) {
      ALL_VERIFICATIONS = data.data
      renderTable(ALL_VERIFICATIONS)
      updateStats(ALL_VERIFICATIONS)
    }
  } catch (err) {
    console.error("Load failed", err)
    alert("Failed to load verifications")
  }
}

/* ===============================
   UPDATE STATS
================================ */
function updateStats(list) {
  const total = list.length
  const active = list.filter((v) => v.status === "ACTIVE").length
  const expired = list.filter((v) => v.status === "EXPIRED").length
  const revoked = list.filter((v) => v.status === "REVOKED").length

  document.getElementById("statTotal").textContent = total
  document.getElementById("statActive").textContent = active
  document.getElementById("statExpired").textContent = expired
  document.getElementById("statRevoked").textContent = revoked
}

/* ===============================
   TABLE RENDER
================================ */
function renderTable(list) {
  const tbody = document.getElementById("verificationsTable")
  if (!tbody) return

  tbody.innerHTML = ""

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="11" style="text-align: center; padding: 2rem; color: var(--text-muted);">
          No verifications found
        </td>
      </tr>
    `
    return
  }

  list.forEach((v) => {
    const sellerLink = `https://wisteriatrust.com/seller/?id=${v.verificationId}`
    const isSelected = SELECTED_IDS.has(v.verificationId)

    let statusActions = ""
    if (v.status === "ACTIVE") {
      statusActions = `
        <button class="btn-action btn-revoke" onclick="revokeVerification('${v.verificationId}')">Revoke</button>
      `
    } else if (v.status === "EXPIRED") {
      statusActions = `
        <button class="btn-action btn-extend" onclick="extendExpiry('${v.verificationId}')">Extend</button>
      `
    }

    const tr = document.createElement("tr")
    tr.innerHTML = `
      <td class="checkbox-cell">
        <input type="checkbox" class="table-checkbox row-checkbox" data-id="${v.verificationId}" ${isSelected ? "checked" : ""}>
      </td>
      <td><span class="id-badge">${v.verificationId}</span></td>
      <td>${v.sellerName}</td>
      <td>${v.businessName}</td>
      <td>${v.city}</td>
      <td>${v.email}</td>
      <td><span class="status-badge status-${v.status.toLowerCase()}">${v.status}</span></td>
      <td>${new Date(v.expiryDate).toLocaleDateString()}</td>
      <td>${new Date(v.createdAt).toLocaleDateString()}</td>
      <td>
        <div class="action-icons">
          <button class="icon-btn" title="Open" onclick="window.open('${sellerLink}', '_blank')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </button>
          <button class="icon-btn" title="Copy" onclick="copyLink('${sellerLink}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
        </div>
      </td>
      <td>
        <div class="action-buttons">
          <button class="btn-action btn-edit" onclick="openEditModal('${v.verificationId}')">Edit</button>
          ${statusActions}
          <button class="btn-action btn-delete" onclick="deleteVerification('${v.verificationId}')">Delete</button>
        </div>
      </td>
    `

    tbody.appendChild(tr)
  })

  document.querySelectorAll(".row-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", handleCheckboxChange)
  })
}

/* ===============================
   SEARCH AND FILTER
================================ */
function filterTable() {
  const searchInput = document.getElementById("searchInput")
  const statusFilter = document.getElementById("statusFilter")
  const dateFilter = document.getElementById("dateFilter")

  const searchTerm = searchInput ? searchInput.value.toLowerCase() : ""
  const statusValue = statusFilter ? statusFilter.value : ""
  const dateValue = dateFilter ? dateFilter.value : ""

  let filtered = ALL_VERIFICATIONS.filter((v) => {
    const matchesSearch =
      v.verificationId.toLowerCase().includes(searchTerm) ||
      v.sellerName.toLowerCase().includes(searchTerm) ||
      v.businessName.toLowerCase().includes(searchTerm) ||
      v.email.toLowerCase().includes(searchTerm)

    const matchesStatus = !statusValue || v.status === statusValue

    return matchesSearch && matchesStatus
  })

  if (dateValue) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    filtered = filtered.filter((v) => {
      const createdDate = new Date(v.createdAt)
      const expiryDate = new Date(v.expiryDate)

      switch (dateValue) {
        case "today":
          return createdDate >= today
        case "week":
          const weekAgo = new Date(today)
          weekAgo.setDate(weekAgo.getDate() - 7)
          return createdDate >= weekAgo
        case "month":
          const monthAgo = new Date(today)
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          return createdDate >= monthAgo
        case "expiring":
          const sevenDaysLater = new Date(today)
          sevenDaysLater.setDate(sevenDaysLater.getDate() + 7)
          return expiryDate <= sevenDaysLater && expiryDate >= today && v.status === "ACTIVE"
        default:
          return true
      }
    })
  }

  renderTable(filtered)
  updateStats(filtered)
}

/* ===============================
   BULK SELECTION
================================ */
function toggleSelectAll(e) {
  const checked = e.target.checked
  const checkboxes = document.querySelectorAll(".row-checkbox")

  if (checked) {
    checkboxes.forEach((cb) => {
      cb.checked = true
      SELECTED_IDS.add(cb.dataset.id)
    })
  } else {
    checkboxes.forEach((cb) => {
      cb.checked = false
    })
    SELECTED_IDS.clear()
  }

  updateBulkButtons()
}

function handleCheckboxChange(e) {
  const id = e.target.dataset.id
  if (e.target.checked) {
    SELECTED_IDS.add(id)
  } else {
    SELECTED_IDS.delete(id)
    document.getElementById("selectAll").checked = false
  }
  updateBulkButtons()
}

function updateBulkButtons() {
  const bulkDeleteBtn = document.getElementById("bulkDeleteBtn")
  const bulkRevokeBtn = document.getElementById("bulkRevokeBtn")

  const hasSelection = SELECTED_IDS.size > 0

  if (bulkDeleteBtn) {
    bulkDeleteBtn.disabled = !hasSelection
  }

  if (bulkRevokeBtn) {
    bulkRevokeBtn.disabled = !hasSelection
  }
}

/* ===============================
   BULK OPERATIONS
================================ */
async function bulkDelete() {
  if (SELECTED_IDS.size === 0) return

  if (!confirm(`Are you sure you want to delete ${SELECTED_IDS.size} verification(s)? This action cannot be undone.`)) {
    return
  }

  const promises = Array.from(SELECTED_IDS).map((id) =>
    fetch(`${API_BASE_URL}/api/admin/verification/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),
  )

  try {
    await Promise.all(promises)
    alert(`Successfully deleted ${SELECTED_IDS.size} verification(s)`)
    SELECTED_IDS.clear()
    document.getElementById("selectAll").checked = false
    loadVerifications()
  } catch (err) {
    console.error(err)
    alert("Some deletions failed. Please try again.")
    loadVerifications()
  }
}

async function bulkRevoke() {
  if (SELECTED_IDS.size === 0) return

  if (!confirm(`Are you sure you want to revoke ${SELECTED_IDS.size} verification(s)?`)) {
    return
  }

  const promises = Array.from(SELECTED_IDS).map((id) =>
    fetch(`${API_BASE_URL}/api/admin/verification/${id}/revoke`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    }),
  )

  try {
    await Promise.all(promises)
    alert(`Successfully revoked ${SELECTED_IDS.size} verification(s)`)
    SELECTED_IDS.clear()
    document.getElementById("selectAll").checked = false
    loadVerifications()
  } catch (err) {
    console.error(err)
    alert("Some revocations failed. Please try again.")
    loadVerifications()
  }
}

/* ===============================
   EXPORT TO CSV
================================ */
function exportToCSV() {
  if (ALL_VERIFICATIONS.length === 0) {
    alert("No data to export")
    return
  }

  const headers = ["ID", "Seller Name", "Business Name", "City", "Email", "Status", "Expiry Date", "Created Date"]
  const csvRows = [headers.join(",")]

  ALL_VERIFICATIONS.forEach((v) => {
    const row = [
      v.verificationId,
      `"${v.sellerName}"`,
      `"${v.businessName}"`,
      `"${v.city}"`,
      v.email,
      v.status,
      new Date(v.expiryDate).toLocaleDateString(),
      new Date(v.createdAt).toLocaleDateString(),
    ]
    csvRows.push(row.join(","))
  })

  const csvContent = csvRows.join("\n")
  const blob = new Blob([csvContent], { type: "text/csv" })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `wisteria-verifications-${new Date().toISOString().split("T")[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

/* ===============================
   COPY LINK
================================ */
function copyLink(link) {
  navigator.clipboard.writeText(link)
  alert("Link copied to clipboard!")
}

/* ===============================
   EDIT MODAL
================================ */
function openEditModal(id) {
  const v = ALL_VERIFICATIONS.find((x) => x.verificationId === id)
  if (!v) return

  EDIT_ID = id

  document.getElementById("editSeller").value = v.sellerName
  document.getElementById("editBusiness").value = v.businessName
  document.getElementById("editCity").value = v.city
  document.getElementById("editEmail").value = v.email

  const dateObj = new Date(v.expiryDate)
  const formattedDate = dateObj.toISOString().split("T")[0]
  document.getElementById("editExpiry").value = formattedDate

  const modal = document.getElementById("editModal")
  modal.style.display = "flex"
}

function closeEditModal() {
  const modal = document.getElementById("editModal")
  modal.style.display = "none"
  EDIT_ID = null
}

async function saveEdit() {
  if (!EDIT_ID) return

  const sellerName = document.getElementById("editSeller").value.trim()
  const businessName = document.getElementById("editBusiness").value.trim()
  const city = document.getElementById("editCity").value.trim()
  const email = document.getElementById("editEmail").value.trim()
  const expiryDate = document.getElementById("editExpiry").value

  if (!sellerName || !businessName || !city || !email || !expiryDate) {
    alert("All fields are required")
    return
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/verification/${EDIT_ID}/update`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        sellerName,
        businessName,
        city,
        email,
        expiryDate,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.message || "Update failed")
      return
    }

    alert("Verification updated successfully!")
    closeEditModal()
    loadVerifications()
  } catch (err) {
    console.error(err)
    alert("Update error. Please try again.")
  }
}

/* ===============================
   DELETE
================================ */
async function deleteVerification(id) {
  if (!confirm("Are you sure you want to delete this verification? This action cannot be undone.")) {
    return
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/verification/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.message || "Delete failed")
      return
    }

    alert("Verification deleted successfully!")
    loadVerifications()
  } catch (err) {
    console.error(err)
    alert("Delete error. Please try again.")
  }
}

/* ===============================
   STATUS ACTIONS
================================ */
async function revokeVerification(id) {
  if (!confirm("Are you sure you want to revoke this verification?")) {
    return
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/verification/${id}/revoke`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.message || "Revoke failed")
      return
    }

    alert("Verification revoked successfully!")
    loadVerifications()
  } catch (err) {
    console.error(err)
    alert("Revoke error. Please try again.")
  }
}

async function expireVerification(id) {
  if (!confirm("Are you sure you want to expire this verification?")) {
    return
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/verification/${id}/expire`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.message || "Expire failed")
      return
    }

    alert("Verification expired successfully!")
    loadVerifications()
  } catch (err) {
    console.error(err)
    alert("Expire error. Please try again.")
  }
}

async function extendExpiry(id) {
  const newDate = prompt("Enter new expiry date (YYYY-MM-DD):")
  if (!newDate) return

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(newDate)) {
    alert("Invalid date format. Please use YYYY-MM-DD")
    return
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/verification/${id}/extend`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ expiryDate: newDate }),
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.message || "Extend failed")
      return
    }

    alert("Expiry date extended successfully!")
    loadVerifications()
  } catch (err) {
    console.error(err)
    alert("Extend error. Please try again.")
  }
}

/* ===============================
   KEYBOARD SHORTCUTS
================================ */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeEditModal()
  }
})
