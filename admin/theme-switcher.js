// Theme Switcher for Wisteria Trust Admin Panel
// Manages dark/light theme toggle with localStorage persistence

;(() => {
  const THEME_KEY = "wisteria-admin-theme"
  const LIGHT_THEME_CLASS = "light-theme"

  // Get system preference
  function getSystemTheme() {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light"
    }
    return "dark"
  }

  // Get saved theme or use system preference
  function getSavedTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY)
    return savedTheme || getSystemTheme()
  }

  // Apply theme to document
  function applyTheme(theme) {
    if (theme === "light") {
      document.body.classList.add(LIGHT_THEME_CLASS)
    } else {
      document.body.classList.remove(LIGHT_THEME_CLASS)
    }
  }

  // Save theme preference
  function saveTheme(theme) {
    localStorage.setItem(THEME_KEY, theme)
  }

  // Toggle theme
  function toggleTheme() {
    const currentTheme = document.body.classList.contains(LIGHT_THEME_CLASS) ? "light" : "dark"
    const newTheme = currentTheme === "light" ? "dark" : "light"

    applyTheme(newTheme)
    saveTheme(newTheme)
  }

  // Initialize theme on page load
  function initTheme() {
    const theme = getSavedTheme()
    applyTheme(theme)
  }

  // Setup theme toggle button
  function setupToggleButton() {
    const toggleBtn = document.getElementById("themeToggle")
    if (toggleBtn) {
      toggleBtn.addEventListener("click", toggleTheme)
    }
  }

  // Listen for system theme changes
  function watchSystemTheme() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: light)")
      mediaQuery.addEventListener("change", (e) => {
        // Only auto-switch if user hasn't set a preference
        if (!localStorage.getItem(THEME_KEY)) {
          applyTheme(e.matches ? "light" : "dark")
        }
      })
    }
  }

  // Initialize everything when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initTheme()
      setupToggleButton()
      watchSystemTheme()
    })
  } else {
    initTheme()
    setupToggleButton()
    watchSystemTheme()
  }
})()
