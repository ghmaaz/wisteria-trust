const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');

menuBtn.onclick = () => {
  menuBtn.classList.toggle('menu-open');
  mobileMenu.classList.toggle('active');
};

document.querySelectorAll('.m-link').forEach(link=>{
  link.addEventListener('click',()=>{
    mobileMenu.classList.remove('active');
    menuBtn.classList.remove('menu-open');
  });
});

function verifySeller(){
  const v = document.getElementById('vid').value.trim();
  const out = document.getElementById('output');

  out.innerHTML =
    v === 'WT-2025-001'
    ? "<div class='result'>Status: Active<br>Valid Till: 31 Dec 2025</div>"
    : "<div class='result'>This seller is not verified by Wisteria Trust.</div>";
}
