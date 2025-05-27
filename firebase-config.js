// js/firebase-config.js

const firebaseConfig = {
  apiKey: "AIzaSyAEZzbOune3lfB2YFkYMSlg2CZJbAlGQdw",
  authDomain: "smartshopmanager59.firebaseapp.com",
  projectId: "smartshopmanager59",
  storageBucket: "smartshopmanager59.appspot.com",
  messagingSenderId: "697076760349",
  appId: "1:697076760349:web:484fd62ea3806a3f92ebf4"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
