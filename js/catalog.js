// js/catalog.js - Complete Working Version

console.log('Catalog.js loaded');

const CATEGORY_NAMES = {
  social: '📱 Social Accounts',
  vpn: '🔒 VPN Services',
  numbers: '📞 Foreign Numbers',
  sites: '🌐 Private Sites',
  other: '✨ Other'
};

let allProducts = [];
let currentCategory = 'all';

// Load products from Firebase
async function loadProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) {
    console.error('productsGrid not found!');
    return;
  }
  
  console.log('Loading products...');
  
  grid.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>Loading products...</p>
    </div>
  `;
  
  try {
    // Check if Firebase is ready
    if (typeof db === 'undefined') {
      throw new Error('Firebase db not initialized. Check firebase-config.js');
    }
    
    console.log('Querying Firebase...');
    
    // FIXED: Removed .orderBy() to avoid index error
    // You can add .orderBy('createdAt', 'desc') back after creating the index
    const snapshot = await db.collection('products')
      .where('available', '==', true)
      .get();
    
    console.log('Snapshot size:', snapshot.size);
    
    if (snapshot.empty) {
      grid.innerHTML = `
        <div class="empty-state">
          <p>📦 No products available yet.</p>
          <p style="font-size:14px; margin-top:10px;">Check back soon!</p>
          <button onclick="loadProducts()" style="margin-top:1rem; padding:0.5rem 1rem; background:var(--accent-color); border:none; border-radius:40px; color:white; cursor:pointer;">Refresh</button>
        </div>
      `;
      return;
    }
    
    allProducts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('Products loaded:', allProducts.length);
    renderProducts();
    
  } catch (error) {
    console.error('Error loading products:', error);
    
    // Check if it's an index error
    if (error.message && error.message.includes('index')) {
      grid.innerHTML = `
        <div class="error-state">
          <p>⚠️ Need to create Firebase index.</p>
          <p style="font-size:12px; margin-top:5px;">Click the link in console or wait a moment.</p>
          <button onclick="loadProducts()" style="margin-top:1rem; padding:0.5rem 1rem; background:var(--accent-color); border:none; border-radius:40px; color:white; cursor:pointer;">Retry</button>
        </div>
      `;
    } else {
      grid.innerHTML = `
        <div class="error-state">
          <p>❌ ${error.message}</p>
          <button onclick="location.reload()" style="margin-top:1rem; padding:0.5rem 1rem; background:var(--accent-color); border:none; border-radius:40px; color:white; cursor:pointer;">Refresh Page</button>
        </div>
      `;
    }
  }
}

// Render products grid
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  const searchInput = document.getElementById('searchInput');
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
  
  let filtered = allProducts.filter(product => {
    const matchCategory = currentCategory === 'all' || product.category === currentCategory;
    const matchSearch = product.name.toLowerCase().includes(searchTerm) ||
                        (product.description || '').toLowerCase().includes(searchTerm);
    return matchCategory && matchSearch;
  });
  
  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state"><p>No products found.</p></div>`;
    return;
  }
  
  grid.innerHTML = filtered.map(product => `
    <div class="product-card" onclick="goToProductDetail('${product.id}')">
      <div class="product-thumb">
        ${product.imageUrl ? 
          `<img src="${product.imageUrl}" alt="${escapeHtml(product.name)}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">` : 
          `<div class="no-image">📦</div>`
        }
      </div>
      <div class="product-body">
        <span class="product-badge">${CATEGORY_NAMES[product.category] || product.category}</span>
        <h3 class="product-name">${escapeHtml(product.name)}</h3>
        <p class="product-desc">${escapeHtml((product.description || '').substring(0, 80))}${product.description && product.description.length > 80 ? '...' : ''}</p>
        <div class="product-footer">
          <span class="product-price">₦${Number(product.price).toLocaleString()}</span>
          <button class="product-buy" onclick="event.stopPropagation(); goToProductDetail('${product.id}')">
            View Details →
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Navigate to product detail page
function goToProductDetail(productId) {
  window.location.href = `product-detail.html?id=${productId}`;
}

// Filter by category
function filterByCategory(category) {
  currentCategory = category;
  renderProducts();
  
  document.querySelectorAll('.category-pill').forEach(btn => {
    if (btn.dataset.cat === category) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Escape HTML to prevent XSS
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing catalog...');
  loadProducts();
  
  // Search input
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', renderProducts);
  }
  
  // Category pills
  document.querySelectorAll('.category-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      filterByCategory(btn.dataset.cat);
    });
  });
  
  // URL category parameter
  const urlParams = new URLSearchParams(window.location.search);
  const catParam = urlParams.get('cat');
  if (catParam) {
    filterByCategory(catParam);
  }
});