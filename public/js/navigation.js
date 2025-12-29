js/navigation.js// Responsive Burger Menu Navigation
document.addEventListener('DOMContentLoaded', function() {
  // Create burger button if it doesn't exist
  const nav = document.querySelector('nav');
  if (!nav) return;
  
  // Check if burger menu already exists
  if (document.querySelector('.burger-menu')) return;
  
  // Create burger button HTML
  const burgerHTML = `
    <button class="burger-menu" id="burgerMenu" aria-label="Toggle menu">
      <span></span>
      <span></span>
      <span></span>
    </button>
  `;
  
  // Insert burger button
  nav.innerHTML = burgerHTML + nav.innerHTML;
  
  // Get elements
  const burger = document.getElementById('burgerMenu');
  const navUl = nav.querySelector('ul');
  
  if (!burger || !navUl) return;
  
  // Toggle menu on burger click
  burger.addEventListener('click', function(e) {
    e.stopPropagation();
    navUl.classList.toggle('mobile-visible');
    burger.classList.toggle('active');
  });
  
  // Close menu when clicking links
  navUl.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function() {
      navUl.classList.remove('mobile-visible');
      burger.classList.remove('active');
    });
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!nav.contains(e.target)) {
      navUl.classList.remove('mobile-visible');
      burger.classList.remove('active');
    }
  });
  
  // Add responsive styles
  const style = document.createElement('style');
  style.textContent = `
    .burger-menu {
      display: none;
      flex-direction: column;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      gap: 0.4rem;
    }
    
    .burger-menu span {
      width: 25px;
      height: 3px;
      background: #fff;
      border-radius: 2px;
      transition: all 0.3s ease;
    }
    
    .burger-menu.active span:nth-child(1) {
      transform: rotate(45deg) translate(8px, 8px);
    }
    
    .burger-menu.active span:nth-child(2) {
      opacity: 0;
    }
    
    .burger-menu.active span:nth-child(3) {
      transform: rotate(-45deg) translate(7px, -7px);
    }
    
    @media (max-width: 768px) {
      .burger-menu {
        display: flex;
      }
      
      nav ul {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        flex-direction: column;
        background: rgba(15,20,25,0.98);
        padding: 1rem 0;
        gap: 0;
        border-bottom: 1px solid rgba(100,200,255,0.2);
      }
      
      nav ul.mobile-visible {
        display: flex;
      }
      
      nav ul li {
        width: 100%;
      }
      
      nav ul a {
        display: block;
        padding: 0.8rem 1.5rem;
        border-bottom: 1px solid rgba(100,200,255,0.1);
      }
      
      .dropdown-menu {
        position: static !important;
        display: none !important;
        border: none !important;
        background: rgba(100,200,255,0.05) !important;
        padding: 0 !important;
        margin: 0 !important;
        box-shadow: none !important;
      }
      
      .nav-dropdown.expanded .dropdown-menu {
        display: flex !important;
      }
      
      .dropdown-menu a {
        padding: 0.6rem 2rem !important;
        border: none !important;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Handle dropdown expansion on mobile
  const dropdowns = document.querySelectorAll('.nav-dropdown');
  dropdowns.forEach(dropdown => {
    const link = dropdown.querySelector('a');
    if (link) {
      link.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          dropdown.classList.toggle('expanded');
        }
      });
    }
  });
});

// Update mobile menu on window resize
window.addEventListener('resize', function() {
  if (window.innerWidth > 768) {
    const navUl = document.querySelector('nav ul');
    const burger = document.querySelector('.burger-menu');
    if (navUl) navUl.classList.remove('mobile-visible');
    if (burger) burger.classList.remove('active');
  }
});
