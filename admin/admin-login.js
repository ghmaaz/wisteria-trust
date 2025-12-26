// Admin Login Handler for Wisteria Trust

const API_BASE_URL = "https://wisteria-backend.onrender.com"

document.addEventListener("DOMContentLoaded", () => {
  // Check if already logged in
  const token = localStorage.getItem("adminToken")
  if (token) {
    window.location.href = "dashboard.html"
  }

  // Handle login form submission
  const loginForm = document.getElementById("loginForm")
  const loginBtn = document.getElementById("loginBtn")
  const errorMessage = document.getElementById("errorMessage")

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const username = document.getElementById("username").value.trim()
    const password = document.getElementById("password").value

    // Clear previous error
    errorMessage.textContent = ""
    errorMessage.style.display = "none"

    // Disable button during login
    loginBtn.disabled = true
    loginBtn.textContent = "Signing in..."

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok && data.token) {
        // Store token
        localStorage.setItem("adminToken", data.token)

        // Store admin info if provided
        if (data.admin) {
          localStorage.setItem("adminInfo", JSON.stringify(data.admin))
        }

        // Redirect to dashboard
        window.location.href = "dashboard.html"
      } else {
        // Show error message
        errorMessage.textContent = data.message || "Invalid username or password"
        errorMessage.style.display = "block"
        loginBtn.disabled = false
        loginBtn.textContent = "Sign In"
      }
    } catch (error) {
      console.error("Login error:", error)
      errorMessage.textContent = "Unable to connect to server. Please try again."
      errorMessage.style.display = "block"
      loginBtn.disabled = false
      loginBtn.textContent = "Sign In"
    }
  })
})
