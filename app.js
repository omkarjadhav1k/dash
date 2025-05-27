// js/app.js

document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  // Example: Load dashboard stats
  if (path.includes("dashboard.html")) {
    loadDashboard();
  }

  // More page-specific code can be added here...
});

function loadDashboard() {
  // Sample Firestore logic for dashboard summary
  db.collection("products").get().then(snapshot => {
    const totalProducts = snapshot.size;
    document.getElementById("total-products").textContent = totalProducts;

    let totalItems = 0;
    let totalValue = 0;
    snapshot.forEach(doc => {
      const data = doc.data();
      totalItems += data.quantity || 0;
      totalValue += (data.price || 0) * (data.quantity || 0);
    });

    if (document.getElementById("total-items")) {
      document.getElementById("total-items").textContent = totalItems;
    }
    if (document.getElementById("total-stock")) {
      document.getElementById("total-stock").textContent = `₹${totalValue.toFixed(2)}`;
    }
  });
}
