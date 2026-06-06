// js/firebase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyAjZ2yiIMEUJ7XtDVhtJfq4HWs6PntnRbc",
    authDomain: "alfredd-place.firebaseapp.com",
    projectId: "alfredd-place",
    storageBucket: "alfredd-place.firebasestorage.app",
    messagingSenderId: "190042574479",
    appId: "1:190042574479:web:3226c2f7abdb83315eaafa",
    measurementId: "G-6J84VHN1N8"
  };
  
  // Initialize Firebase
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  
  // Make db and storage available globally
  const db = firebase.firestore();
  const storage = firebase.storage();
  
  console.log('✅ Firebase initialized, db ready:', !!db);