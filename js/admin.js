// js/admin.js - Complete Working Admin Panel

// ============================================
// CHECK LOGIN STATUS
// ============================================
function checkAuth() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
        window.location.href = 'admin-login.html';
    }
}
checkAuth();

// ============================================
// WAIT FOR DOM TO LOAD
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin panel loaded');
    
    // Load products
    loadProducts();
    
    // Setup tab buttons
    setupTabs();
    
    // Setup add product button
    const submitBtn = document.getElementById('submitProductBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', addProduct);
    }
    
    // Setup search
    const searchInput = document.getElementById('adminSearch');
    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }
    
    // Setup delete modal
    setupDeleteModal();
});

// ============================================
// TAB SWITCHING
// ============================================
function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            if (tabName === 'logout') {
                logout();
                return;
            }
            
            // Remove active class from all tabs and contents
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to current tab
            this.classList.add('active');
            
            // Show selected content
            const content = document.getElementById(`tab-${tabName}`);
            if (content) content.classList.add('active');
            
            // Load data if needed
            if (tabName === 'products') {
                loadProducts();
            } else if (tabName === 'orders') {
                loadOrders();
            }
        });
    });
}

// ============================================
// LOGOUT
// ============================================
function logout() {
    localStorage.removeItem('adminLoggedIn');
    window.location.href = 'admin-login.html';
}

// ============================================
// LOAD PRODUCTS
// ============================================
async function loadProducts() {
    const container = document.getElementById('adminProductsList');
    if (!container) return;
    
    container.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading products...</p>
        </div>
    `;
    
    try {
        const snapshot = await db.collection('products')
            .orderBy('createdAt', 'desc')
            .get();
        
        if (snapshot.empty) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No products yet. Click "Add New Product" to get started.</p>
                </div>
            `;
            return;
        }
        
        window.allProducts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        renderProductList(window.allProducts);
        
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = `
            <div class="error-state">
                <p>Error loading products. Make sure Firebase is configured correctly.</p>
                <button onclick="loadProducts()" style="margin-top:1rem; padding:0.5rem 1rem; background:var(--accent-color); border:none; border-radius:40px; color:white; cursor:pointer;">Retry</button>
            </div>
        `;
    }
}

// ============================================
// RENDER PRODUCT LIST
// ============================================
function renderProductList(products) {
    const container = document.getElementById('adminProductsList');
    if (!container) return;
    
    if (!products || products.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No products found.</p></div>';
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="product-admin-card">
            <div class="product-admin-image">
                ${product.imageUrl ? 
                    `<img src="${product.imageUrl}" onerror="this.src='https://via.placeholder.com/80x80?text=No+Image'">` : 
                    '<div class="no-image">📦</div>'
                }
            </div>
            <div class="product-admin-info">
                <div class="product-admin-name">${escapeHtml(product.name)}</div>
                <div class="product-admin-category">${product.category || 'other'}</div>
                <div class="product-admin-price">₦${Number(product.price).toLocaleString()}</div>
            </div>
            <div class="product-admin-actions">
                <button class="btn-danger-small" onclick="showDeleteModal('${product.id}', '${escapeHtml(product.name)}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// ============================================
// FILTER PRODUCTS
// ============================================
function filterProducts() {
    const searchTerm = document.getElementById('adminSearch')?.value.toLowerCase() || '';
    if (!window.allProducts) return;
    
    const filtered = window.allProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm)
    );
    
    renderProductList(filtered);
}

// ============================================
// ADD PRODUCT
// ============================================
async function addProduct() {
    const name = document.getElementById('productName')?.value.trim();
    const category = document.getElementById('productCategory')?.value;
    const price = parseFloat(document.getElementById('productPrice')?.value);
    const description = document.getElementById('productDesc')?.value.trim();
    const imageUrl = document.getElementById('productImageUrl')?.value.trim();
    const available = document.getElementById('productAvailable')?.checked;
    
    // Validation
    if (!name) {
        alert('Please enter product name');
        return;
    }
    if (!price || isNaN(price)) {
        alert('Please enter a valid price');
        return;
    }
    if (!description) {
        alert('Please enter product description');
        return;
    }
    
    const submitBtn = document.getElementById('submitProductBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Adding...';
    }
    
    try {
        await db.collection('products').add({
            name: name,
            category: category,
            price: price,
            description: description,
            imageUrl: imageUrl || null,
            available: available !== undefined ? available : true,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        alert('✅ Product added successfully!');
        
        // Clear form
        document.getElementById('productName').value = '';
        document.getElementById('productPrice').value = '';
        document.getElementById('productDesc').value = '';
        document.getElementById('productImageUrl').value = '';
        document.getElementById('productAvailable').checked = true;
        
        // Switch to products tab
        document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.querySelector('.tab-btn[data-tab="products"]').classList.add('active');
        document.getElementById('tab-products').classList.add('active');
        
        // Reload products
        loadProducts();
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Failed to add product: ' + error.message);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Add Product';
        }
    }
}

// ============================================
// DELETE MODAL
// ============================================
let deleteProductId = null;

function setupDeleteModal() {
    const modal = document.getElementById('deleteModal');
    const closeBtn = document.getElementById('deleteModalClose');
    const cancelBtn = document.getElementById('cancelDeleteBtn');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeDeleteModal);
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeDeleteModal);
    }
    if (confirmBtn) {
        confirmBtn.addEventListener('click', confirmDelete);
    }
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeDeleteModal();
        });
    }
}

function showDeleteModal(id, name) {
    deleteProductId = id;
    const nameSpan = document.getElementById('deleteProductName');
    if (nameSpan) nameSpan.textContent = `"${name}"`;
    const modal = document.getElementById('deleteModal');
    if (modal) modal.classList.add('open');
}

function closeDeleteModal() {
    deleteProductId = null;
    const modal = document.getElementById('deleteModal');
    if (modal) modal.classList.remove('open');
}

async function confirmDelete() {
    if (!deleteProductId) return;
    
    try {
        await db.collection('products').doc(deleteProductId).delete();
        alert('✅ Product deleted successfully!');
        closeDeleteModal();
        loadProducts();
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Failed to delete product: ' + error.message);
    }
}

// ============================================
// LOAD ORDERS
// ============================================
async function loadOrders() {
    const container = document.getElementById('ordersList');
    if (!container) return;
    
    container.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading orders...</p>
        </div>
    `;
    
    try {
        const snapshot = await db.collection('orders')
            .orderBy('createdAt', 'desc')
            .get();
        
        if (snapshot.empty) {
            container.innerHTML = '<div class="empty-state"><p>No orders yet.</p></div>';
            return;
        }
        
        container.innerHTML = '';
        snapshot.forEach(doc => {
            const order = doc.data();
            container.innerHTML += `
                <div class="order-card">
                    <div class="order-header">
                        <span class="order-id">${order.orderId || doc.id.substring(0, 8)}</span>
                        <span class="order-status">Pending</span>
                    </div>
                    <div class="order-details">
                        <div><strong>Product:</strong> ${escapeHtml(order.productName)}</div>
                        <div><strong>Amount:</strong> ₦${Number(order.productPrice).toLocaleString()}</div>
                        <div><strong>Customer:</strong> ${escapeHtml(order.customerName)}</div>
                        <div><strong>Contact:</strong> ${escapeHtml(order.customerContact)}</div>
                        ${order.orderNote ? `<div><strong>Notes:</strong> ${escapeHtml(order.orderNote)}</div>` : ''}
                        <div><strong>Date:</strong> ${order.createdAt ? new Date(order.createdAt.toDate()).toLocaleString() : 'N/A'}</div>
                    </div>
                </div>
            `;
        });
        
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<div class="error-state"><p>Error loading orders.</p></div>';
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}