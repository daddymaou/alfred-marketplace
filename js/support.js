// support.js - Support/Reviews Page with Firebase

// Firebase Configuration (Your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyAjZ2yiIMEUJ7XtDVhtJfq4HWs6PntnRbc",
  authDomain: "alfredd-place.firebaseapp.com",
  projectId: "alfredd-place",
  storageBucket: "alfredd-place.firebasestorage.app",
  messagingSenderId: "190042574479",
  appId: "1:190042574479:web:3226c2f7abdb83315eaafa",
  measurementId: "G-6J84VHN1N8"
};

// Initialize Firebase (check if already initialized)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

let currentRating = 0;

// Toast notification
function showToast(message, isError = false) {
  const toast = document.getElementById('toastMessage');
  if (!toast) return;
  toast.textContent = message;
  toast.style.background = isError ? '#EF4444' : 'var(--accent-color, #F59E0B)';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Format date
function formatDate(date) {
  if (!date) return 'Just now';
  try {
    return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (e) {
    return 'Recently';
  }
}

// Render a single review card
function renderReviewCard(review) {
  const date = review.createdAt?.toDate ? review.createdAt.toDate() : new Date();
  const fullStars = review.rating || 0;
  const emptyStars = 5 - fullStars;
  
  return `
    <div class="review-card">
      <div class="review-header">
        <div>
          <div class="review-name">${escapeHtml(review.name || 'Anonymous')}</div>
          ${review.product ? `<div style="font-size:12px;color:var(--text-muted);margin-top:2px;">${escapeHtml(review.product)}</div>` : ''}
        </div>
        <div class="review-stars">${'★'.repeat(fullStars)}${'☆'.repeat(emptyStars)}</div>
      </div>
      <div class="review-text">${escapeHtml(review.text || '')}</div>
      <div class="review-date">${formatDate(date)}</div>
    </div>
  `;
}

// Load reviews from Firebase
async function loadReviews() {
  const listContainer = document.getElementById('reviewsList');
  const countSpan = document.getElementById('reviewCount');
  
  if (!listContainer) return;
  
  listContainer.innerHTML = `
    <div class="loading-spinner-small">
      <div class="spinner-small"></div>
      <p>Loading reviews...</p>
    </div>
  `;
  
  try {
    const snapshot = await db.collection('reviews')
      .orderBy('createdAt', 'desc')
      .get();
    
    const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (countSpan) {
      countSpan.textContent = reviews.length + ' review' + (reviews.length !== 1 ? 's' : '');
    }
    
    if (!reviews.length) {
      listContainer.innerHTML = '<div class="empty-state-reviews">No reviews yet. Be the first to leave a review!</div>';
      return;
    }
    
    listContainer.innerHTML = reviews.map(renderReviewCard).join('');
    
  } catch (error) {
    console.error('Error loading reviews:', error);
    if (countSpan) countSpan.textContent = '0 reviews';
    listContainer.innerHTML = '<div class="empty-state-reviews">Failed to load reviews. Please refresh the page.</div>';
  }
}

// Add a new review to Firebase
async function addReview(reviewData) {
  try {
    await db.collection('reviews').add({
      name: reviewData.name || 'Anonymous',
      product: reviewData.product || '',
      text: reviewData.text,
      rating: reviewData.rating,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error adding review:', error);
    return false;
  }
}

// Prepend a review to the list (optimistic update)
function prependReview(review) {
  const listContainer = document.getElementById('reviewsList');
  if (!listContainer) return;
  
  const currentHTML = listContainer.innerHTML;
  
  // Remove empty state if present
  if (currentHTML.includes('empty-state-reviews')) {
    listContainer.innerHTML = renderReviewCard(review);
  } else {
    listContainer.insertAdjacentHTML('afterbegin', renderReviewCard(review));
  }
  
  // Update count
  const countSpan = document.getElementById('reviewCount');
  if (countSpan) {
    const currentCount = parseInt(countSpan.textContent) || 0;
    countSpan.textContent = (currentCount + 1) + ' review' + (currentCount !== 0 ? 's' : '');
  }
}

// Submit review handler
async function handleSubmitReview() {
  const nameInput = document.getElementById('reviewName');
  const productInput = document.getElementById('reviewProduct');
  const textInput = document.getElementById('reviewText');
  
  if (!nameInput || !textInput) return;
  
  const name = nameInput.value.trim();
  const product = productInput ? productInput.value.trim() : '';
  const text = textInput.value.trim();
  const rating = currentRating;
  
  if (!text) {
    showToast('Please write your review', true);
    return;
  }
  
  if (rating === 0) {
    showToast('Please select a rating', true);
    return;
  }
  
  const submitBtn = document.getElementById('submitReview');
  if (!submitBtn) return;
  
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';
  
  const reviewData = {
    name: name || 'Anonymous',
    product: product,
    text: text,
    rating: rating
  };
  
  // Optimistic update - show review immediately
  prependReview({
    ...reviewData,
    createdAt: { toDate: () => new Date() }
  });
  
  // Clear form
  nameInput.value = '';
  if (productInput) productInput.value = '';
  textInput.value = '';
  currentRating = 0;
  
  // Reset stars
  const stars = document.querySelectorAll('.star');
  stars.forEach(star => star.classList.remove('active'));
  
  // Save to Firebase
  const success = await addReview(reviewData);
  
  if (success) {
    showToast('Review submitted! Thank you for your feedback.');
  } else {
    showToast('Failed to submit review. Please try again.', true);
    // Reload reviews to fix optimistic update if failed
    loadReviews();
  }
  
  submitBtn.disabled = false;
  submitBtn.textContent = originalText;
}

// Initialize star rating
function initStarRating() {
  const starRow = document.getElementById('starRow');
  if (!starRow) return;
  
  const stars = document.querySelectorAll('.star');
  
  starRow.addEventListener('click', (e) => {
    const star = e.target.closest('.star');
    if (!star) return;
    
    const value = parseInt(star.dataset.v);
    currentRating = value;
    
    stars.forEach(s => {
      const starValue = parseInt(s.dataset.v);
      if (starValue <= value) {
        s.classList.add('active');
      } else {
        s.classList.remove('active');
      }
    });
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Support page loaded');
  initStarRating();
  loadReviews();
  
  const submitBtn = document.getElementById('submitReview');
  if (submitBtn) {
    submitBtn.addEventListener('click', handleSubmitReview);
  }
});