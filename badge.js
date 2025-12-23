(function () {
  const script = document.currentScript;
  const verificationId = script.getAttribute("data-id");

  if (!verificationId) return;

  const badge = document.createElement("div");
  badge.style.fontFamily = "Arial, sans-serif";
  badge.style.fontSize = "13px";
  badge.style.border = "1px solid #0f9d58";
  badge.style.padding = "6px 10px";
  badge.style.borderRadius = "6px";
  badge.style.display = "inline-flex";
  badge.style.alignItems = "center";
  badge.style.gap = "6px";

  fetch(`https://wisteria-backend.onrender.com/api/verify/${verificationId}`)
    .then(res => res.json())
    .then(data => {
      if (!data.verified) {
        badge.style.borderColor = "#d93025";
        badge.innerHTML = "❌ Not verified";
        return;
      }

     badge.innerHTML = `
  <span style="color:#0f9d58;font-weight:600;">✔ Verified by</span>
  <a href="https://wisteriatrust.com/verify.html?id=${verificationId}"
     target="_blank"
     style="color:#0f9d58;text-decoration:none;font-weight:700;">
     Wisteria Trust
  </a>
`;

    })
    .catch(() => {
      badge.innerHTML = "⚠️ Verification unavailable";
    });

  script.parentNode.insertBefore(badge, script);
})();
