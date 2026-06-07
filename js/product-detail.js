// js/product-detail.js - Product Detail Page with WhatsApp Order (No Emojis)
// Cross-browser WhatsApp redirect fix

console.log('Product-detail.js loaded');

// YOUR WHATSAPP NUMBER (without + or spaces)
const WHATSAPP_NUMBER = "2347068913524";

// Category names for display (No emojis)
const CATEGORY_NAMES = {
  social: 'Social Accounts',
  vpn: 'VPN Services',
  numbers: 'Foreign Numbers',
  sites: 'Private Sites',
  other: 'Other'
};

// Get product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

console.log('Product ID:', productId);

// Load product details
async function loadProductDetail() {
  const container = document.getElementById('productDetailContainer');
  if (!container) {
    console.error('productDetailContainer not found!');
    return;
  }
  
  if (!productId) {
    container.innerHTML = `
      <div class="error-state">
        <h3>No Product Selected</h3>
        <p>Please go back to the catalog and select a product.</p>
        <button class="btn-primary" onclick="window.location.href='catalog.html'">Back to Catalog</button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading product details...</p>
    </div>
  `;
  
  try {
    // Check if Firebase is ready
    if (typeof db === 'undefined') {
      throw new Error('Firebase db not initialized. Check firebase-config.js');
    }
    
    console.log('Fetching product:', productId);
    
    const doc = await db.collection('products').doc(productId).get();
    
    if (!doc.exists) {
      container.innerHTML = `
        <div class="error-state">
          <h3>Product Not Found</h3>
          <p>The product you're looking for doesn't exist or has been removed.</p>
          <button class="btn-primary" onclick="window.location.href='catalog.html'">Back to Catalog</button>
        </div>
      `;
      return;
    }
    
    const product = { id: doc.id, ...doc.data() };
    console.log('Product loaded:', product.name);
    renderProductDetail(product);
    
  } catch (error) {
    console.error('Error loading product:', error);
    container.innerHTML = `
      <div class="error-state">
        <h3>Error Loading Product</h3>
        <p>${error.message}</p>
        <button class="btn-primary" onclick="location.reload()">Retry</button>
        <button class="btn-ghost" onclick="window.location.href='catalog.html'" style="margin-left:10px;">Back to Catalog</button>
      </div>
    `;
  }
}

// Render product detail
function renderProductDetail(product) {
  const container = document.getElementById('productDetailContainer');
  
  container.innerHTML = `
    <button class="back-btn" onclick="window.location.href='catalog.html'">
      <i class="fas fa-arrow-left"></i> Back to Catalog
    </button>
    
    <div class="product-detail-card">
      <div class="product-detail-image">
        ${product.imageUrl ? 
          `<img src="${product.imageUrl}" alt="${escapeHtml(product.name)}" onerror="this.src='https://via.placeholder.com/400x400?text=No+Image'">` : 
          `<div class="no-image"><i class="fas fa-box-open"></i><p>No Image Available</p></div>`
        }
      </div>
      
      <div class="product-detail-info">
        <span class="product-detail-category">${CATEGORY_NAMES[product.category] || product.category}</span>
        <h1 class="product-detail-title">${escapeHtml(product.name)}</h1>
        <div class="product-detail-price">₦${Number(product.price).toLocaleString()}</div>
        <p class="product-detail-description">${escapeHtml(product.description || 'No description available.')}</p>
        
        <div class="product-features">
          <h4> What You Get:</h4>
          <ul>
            <li><i class="fas fa-check-circle"></i> Instant delivery after payment</li>
            <li><i class="fas fa-headset"></i> 24/7 customer support</li>
            <li><i class="fas fa-shield-alt"></i> 30-day warranty</li>
            <li><i class="fas fa-lock"></i> Secure transaction</li>
          </ul>
        </div>
        
        <div class="order-form">
          <h4><i class="fab fa-whatsapp"></i> Order via WhatsApp</h4>
          <div class="form-group">
            <label>Your Full Name <span class="required">*</span></label>
            <input type="text" id="customerName" placeholder="Enter your full name">
          </div>
          <div class="form-group">
            <label>Your WhatsApp Number <span class="required">*</span></label>
            <input type="tel" id="customerPhone" placeholder="e.g., 2348012345678">
            <small>Include country code without + (e.g., 234 for Nigeria)</small>
          </div>
          <div class="form-group">
            <label>Additional Notes <span class="optional">(Optional)</span></label>
            <textarea id="orderNote" rows="3" placeholder="Any special requests or questions?"></textarea>
          </div>
          <button class="order-btn" onclick="sendWhatsAppOrder('${product.id}')">
             Order via WhatsApp • ₦${Number(product.price).toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  `;
}

// FIXED: Cross-browser WhatsApp redirect function
function openWhatsApp(phoneNumber, message) {
  // Format phone number (remove any non-digit characters)
  const cleanNumber = phoneNumber.toString().replace(/\D/g, '');
  
  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // Method 1: Try WhatsApp Web URL (works on desktop and mobile browsers)
  const whatsappWebUrl = `https://web.whatsapp.com/send?phone=${cleanNumber}&text=${encodedMessage}`;
  
  // Method 2: WhatsApp API URL (works on mobile devices that have WhatsApp installed)
  const whatsappApiUrl = `whatsapp://send?phone=${cleanNumber}&text=${encodedMessage}`;
  
  // Method 3: Direct wa.me link (fallback for all platforms)
  const waMeUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
  
  // Detect if user is on mobile device
  const isMobile = /iPhone|iPad|iPod|Android|BlackBerry|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
  
  // Detect if user is on iOS
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  
  if (isMobile) {
    // Mobile devices - try WhatsApp app first
    if (isIOS) {
      // iOS: Use whatsapp:// URL scheme
      window.location.href = whatsappApiUrl;
      
      // Fallback to web if app doesn't open
      setTimeout(() => {
        window.location.href = waMeUrl;
      }, 500);
    } else {
      // Android: Try api first, then fallback
      window.location.href = whatsappApiUrl;
      
      setTimeout(() => {
        // If app didn't open, try web version
        window.location.href = waMeUrl;
      }, 500);
    }
  } else {
    // Desktop - use WhatsApp Web
    window.open(whatsappWebUrl, '_blank', 'noopener,noreferrer');
    
    // Also show a helpful message for desktop users
    setTimeout(() => {
      if (!document.querySelector('.whatsapp-desktop-tip')) {
        const tipDiv = document.createElement('div');
        tipDiv.className = 'whatsapp-desktop-tip';
        tipDiv.style.cssText = `
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: #25D366;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 14px;
          z-index: 9999;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          animation: slideIn 0.3s ease-out;
        `;
        tipDiv.innerHTML = `
          If WhatsApp Web doesn't open automatically, 
          <a href="${waMeUrl}" target="_blank" style="color: white; font-weight: bold;">click here</a>
          <button onclick="this.parentElement.remove()" style="margin-left: 10px; background: none; border: none; color: white; cursor: pointer;">x</button>
        `;
        document.body.appendChild(tipDiv);
        
        setTimeout(() => {
          if (tipDiv && tipDiv.remove) tipDiv.remove();
        }, 8000);
      }
    }, 1000);
  }
}

// Send order via WhatsApp - FIXED VERSION
async function sendWhatsAppOrder(productId) {
  const customerName = document.getElementById('customerName')?.value.trim();
  const customerPhone = document.getElementById('customerPhone')?.value.trim();
  const orderNote = document.getElementById('orderNote')?.value.trim();
  
  // Validation
  if (!customerName) {
    alert('Please enter your name');
    document.getElementById('customerName').focus();
    return;
  }
  
  if (!customerPhone) {
    alert('Please enter your WhatsApp number');
    document.getElementById('customerPhone').focus();
    return;
  }
  
  // Validate phone number (basic)
  const phoneRegex = /^[0-9]{10,15}$/;
  if (!phoneRegex.test(customerPhone)) {
    alert('Please enter a valid phone number (10-15 digits, no spaces or special characters)');
    document.getElementById('customerPhone').focus();
    return;
  }
  
  // Show loading state on button
  const orderBtn = document.querySelector('.order-btn');
  const originalText = orderBtn.innerHTML;
  orderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending to WhatsApp...';
  orderBtn.disabled = true;
  
  try {
    const doc = await db.collection('products').doc(productId).get();
    
    if (!doc.exists) {
      throw new Error('Product not found');
    }
    
    const product = doc.data();
    
    // Create formatted WhatsApp message (no emojis)
    const message = createWhatsAppMessage(
      customerName, 
      customerPhone, 
      product, 
      orderNote
    );
    
    // Save order to Firebase (optional - for admin panel)
    try {
      await db.collection('orders').add({
        productId: productId,
        productName: product.name,
        productPrice: product.price,
        customerName: customerName,
        customerContact: customerPhone,
        orderNote: orderNote || '',
        status: 'pending',
        orderId: generateOrderId(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log('Order saved to Firebase');
    } catch (saveError) {
      console.warn('Could not save order to Firebase:', saveError);
    }
    
    // USE THE NEW CROSS-BROWSER FUNCTION
    openWhatsApp(WHATSAPP_NUMBER, message);
    
    // Show success message
    setTimeout(() => {
      alert('WhatsApp is opening. Please send the message to complete your order.');
    }, 500);
    
    // Clear form
    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('orderNote').value = '';
    
    // Optional: Redirect back to catalog after 8 seconds
    setTimeout(() => {
      const shouldRedirect = confirm('Return to catalog?');
      if (shouldRedirect) {
        window.location.href = 'catalog.html';
      }
    }, 8000);
    
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to place order. Please try again.\n\nError: ' + error.message);
  } finally {
    // Reset button
    orderBtn.innerHTML = originalText;
    orderBtn.disabled = false;
  }
}

// Create formatted WhatsApp message (No emojis)
function createWhatsAppMessage(name, phone, product, note) {
  const date = new Date().toLocaleString('en-NG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  let message = `*NEW ORDER - ALFREDD Marketplace*\n\n`;
  message += `----------------------------------------\n`;
  message += `PRODUCT DETAILS\n`;
  message += `----------------------------------------\n`;
  message += `Name: ${product.name}\n`;
  message += `Category: ${CATEGORY_NAMES[product.category] || product.category}\n`;
  message += `Price: ₦${Number(product.price).toLocaleString()}\n\n`;
  
  message += `----------------------------------------\n`;
  message += `CUSTOMER DETAILS\n`;
  message += `----------------------------------------\n`;
  message += `Name: ${name}\n`;
  message += `WhatsApp: ${phone}\n\n`;
  
  if (note && note.trim()) {
    message += `----------------------------------------\n`;
    message += `ADDITIONAL NOTES\n`;
    message += `----------------------------------------\n`;
    message += `${note}\n\n`;
  }
  
  message += `----------------------------------------\n`;
  message += `Order Date: ${date}\n`;
  message += `----------------------------------------\n\n`;
  message += `Please confirm availability and share payment details.\n`;
  message += `Thank you for choosing ALFREDD!`;
  
  return message;
}

// Generate unique order ID
function generateOrderId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `ORD-${timestamp}-${random}`.toUpperCase();
}

// Escape HTML
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
  console.log('DOM loaded, initializing product detail...');
  loadProductDetail();
});

// Add CSS animation for the tip message
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);
