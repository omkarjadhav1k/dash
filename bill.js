const stock = JSON.parse(localStorage.getItem('stockData')) || [];
const customers = JSON.parse(localStorage.getItem('customerData')) || {};
let basket = [];

function autoFillCustomer() {
  const mobile = document.getElementById('custMobile').value;
  if (customers[mobile]) {
    document.getElementById('custName').value = customers[mobile].name;
  }
}

function filterProducts() {
  const search = document.getElementById('searchItem').value.toLowerCase();
  const suggestions = document.getElementById('suggestions');
  suggestions.innerHTML = '';

  stock
    .filter(p => p.name.toLowerCase().includes(search))
    .forEach(p => {
      const li = document.createElement('li');
      li.textContent = `${p.name} - ₹${p.price}`;
      li.className = 'p-2 hover:bg-gray-100 cursor-pointer';
      li.onclick = () => {
        document.getElementById('searchItem').value = p.name;
        suggestions.innerHTML = '';
      };
      suggestions.appendChild(li);
    });
}

function addToBasket() {
  const name = document.getElementById('searchItem').value.trim();
  const qty = parseInt(document.getElementById('searchQty').value);
  if (!name || isNaN(qty) || qty <= 0) return alert("Enter valid name and quantity");

  const product = stock.find(p => p.name.toLowerCase() === name.toLowerCase());
  if (!product) return alert("Product not found in stock");

  const existing = basket.find(b => b.name === product.name);
  if (existing) {
    existing.qty += qty;
  } else {
    basket.push({ name: product.name, price: product.price, qty });
  }

  renderBasket();
}

function renderBasket() {
  const tbody = document.getElementById('basketList');
  tbody.innerHTML = '';
  let total = 0;

  basket.forEach((item, index) => {
    const subTotal = item.price * item.qty;
    total += subTotal;
    tbody.innerHTML += `
      <tr>
        <td class="p-2">${item.name}</td>
        <td class="p-2">₹${item.price}</td>
        <td class="p-2">${item.qty}</td>
        <td class="p-2">₹${subTotal}</td>
        <td class="p-2">
          <button onclick="removeItem(${index})" class="text-red-600 hover:underline">Remove</button>
        </td>
      </tr>`;
  });

  document.getElementById('grandTotal').innerText = total.toFixed(2);
}

function removeItem(index) {
  basket.splice(index, 1);
  renderBasket();
}

function generateBill() {
  const name = document.getElementById('custName').value.trim();
  const mobile = document.getElementById('custMobile').value.trim();
  if (!name || !mobile) return alert("Enter customer details");

  // Save customer
  customers[mobile] = { name };
  localStorage.setItem('customerData', JSON.stringify(customers));

  // Show alert (replace with print/download feature later)
  alert(`Bill generated for ${name}. Total: ₹${document.getElementById('grandTotal').innerText}`);

  // Reset
  basket = [];
  renderBasket();
  document.getElementById('custName').value = '';
  document.getElementById('custMobile').value = '';
  document.getElementById('searchItem').value = '';
}
