// admin-login.js - Simple Admin Authentication

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'alfredd@2026!';

function showToast(message, isError = false) {
  let toast = document.querySelector('.toast-message');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-message';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.background = isError ? '#EF4444' : 'var(--accent-color)';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function showError(message) {
  const errorDiv = document.getElementById('loginError');
  errorDiv.textContent = message;
  errorDiv.classList.add('show');
}

function hideError() {
  const errorDiv = document.getElementById('loginError');
  errorDiv.classList.remove('show');
  errorDiv.textContent = '';
}

function setLoading(isLoading) {
  const loginBtn = document.getElementById('loginBtn');
  const btnText = loginBtn.querySelector('.btn-text');
  const btnLoader = loginBtn.querySelector('.btn-loader');
  
  if (isLoading) {
    loginBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';
  } else {
    loginBtn.disabled = false;
    btnText.style.display = 'inline';
    btnLoader.style.display = 'none';
  }
}

function login() {
  const username = document.getElementById('adminUsername').value.trim();
  const password = document.getElementById('adminPassword').value;
  
  hideError();
  
  if (!username) {
    showError('Please enter username');
    return;
  }
  if (!password) {
    showError('Please enter password');
    return;
  }
  
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    setLoading(true);
    showToast('Login successful! Redirecting...');
    localStorage.setItem('adminLoggedIn', 'true');
    setTimeout(() => {
      window.location.href = 'admin.html';
    }, 1000);
  } else {
    showError('Invalid username or password');
    showToast('Login failed', true);
    setLoading(false);
  }
}

function handleKeyPress(event) {
  if (event.key === 'Enter') {
    login();
  }
}

function checkAuth() {
  if (localStorage.getItem('adminLoggedIn') === 'true') {
    window.location.href = 'admin.html';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  
  const loginBtn = document.getElementById('loginBtn');
  const usernameInput = document.getElementById('adminUsername');
  const passwordInput = document.getElementById('adminPassword');
  
  loginBtn.addEventListener('click', login);
  passwordInput.addEventListener('keypress', handleKeyPress);
  usernameInput.focus();
});