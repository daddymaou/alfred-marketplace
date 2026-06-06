// index.js - Mobile Menu & Theme Toggle
document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const body = document.body;
  const desktopThemeToggle = document.getElementById('desktopThemeToggle');
  const mobileThemeToggleBtn = document.getElementById('mobileThemeToggleBtn');
  
  // Toggle mobile menu
  function toggleMenu() {
      if (mobileMenu.classList.contains('active')) {
          mobileMenu.classList.remove('active');
      } else {
          mobileMenu.classList.add('active');
      }
  }
  
  // Close menu
  function closeMenu() {
      mobileMenu.classList.remove('active');
  }
  
  // Event listeners for menu
  if (menuBtn && mobileMenu) {
      // Menu button click
      menuBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          toggleMenu();
      });
      
      // Close menu when clicking a mobile nav link
      const mobileLinks = document.querySelectorAll('.mobile-nav-links a');
      mobileLinks.forEach(link => {
          link.addEventListener('click', function() {
              closeMenu();
          });
      });
      
      // Close menu when clicking outside
      document.addEventListener('click', function(event) {
          if (mobileMenu.classList.contains('active')) {
              const isClickInsideMenu = mobileMenu.contains(event.target);
              const isClickOnBtn = menuBtn.contains(event.target);
              
              if (!isClickInsideMenu && !isClickOnBtn) {
                  closeMenu();
              }
          }
      });
  }
  
  // Theme Toggle Function
  function setTheme(isDark) {
      if (isDark) {
          body.classList.add('dark');
          localStorage.setItem('theme', 'dark');
      } else {
          body.classList.remove('dark');
          localStorage.setItem('theme', 'light');
      }
  }
  
  // Load saved theme
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme === 'dark') {
      setTheme(true);
  } else if (savedTheme === 'light') {
      setTheme(false);
  } else {
      // Check system preference
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark);
  }
  
  // Desktop theme toggle
  if (desktopThemeToggle) {
      desktopThemeToggle.addEventListener('click', function() {
          setTheme(!body.classList.contains('dark'));
      });
  }
  
  // Mobile theme toggle
  if (mobileThemeToggleBtn) {
      mobileThemeToggleBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          setTheme(!body.classList.contains('dark'));
      });
  }
  
  // Close menu on window resize
  window.addEventListener('resize', function() {
      if (window.innerWidth > 768 && mobileMenu && mobileMenu.classList.contains('active')) {
          closeMenu();
      }
  });
});