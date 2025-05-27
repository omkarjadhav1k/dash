// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAEZzbOune3lfB2YFkYMSlg2CZJbAlGQdw",
  authDomain: "smartshopmanager59.firebaseapp.com",
  projectId: "smartshopmanager59",
  storageBucket: "smartshopmanager59.appspot.com",
  messagingSenderId: "697076760349",
  appId: "1:697076760349:web:484fd62ea3806a3f92ebf4"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// DOM Elements
const backButton = document.getElementById('backButton');
const addCustomerBtn = document.getElementById('addCustomerBtn');
const saveCustomerBtn = document.getElementById('saveCustomerBtn');
const searchCustomer = document.getElementById('searchCustomer');
const customerFilter = document.getElementById('customerFilter');
const customersTableBody = document.getElementById('customersTableBody');
const totalCustomersElement = document.getElementById('totalCustomers');
const activeCustomersElement = document.getElementById('activeCustomers');
const newCustomersElement = document.getElementById('newCustomers');
const userNameElement = document.getElementById('userName');
const userEmailElement = document.getElementById('userEmail');
const downloadInvoiceBtn = document.getElementById('downloadInvoiceBtn');
const editCustomerBtn = document.getElementById('editCustomerBtn');
const deleteCustomerBtn = document.getElementById('deleteCustomerBtn');

// Modals
const addCustomerModal = new bootstrap.Modal(document.getElementById('addCustomerModal'));
const customerDetailModal = new bootstrap.Modal(document.getElementById('customerDetailModal'));

// Current user and customer data
let currentUser = null;
let customers = [];
let currentCustomerId = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
    setupEventListeners();
});

function checkAuthState() {
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            userNameElement.textContent = user.displayName || 'User';
            userEmailElement.textContent = user.email;
            loadCustomers();
        } else {
            window.location.href = 'login.html';
        }
    });
}

function setupEventListeners() {
    backButton.addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });
    
    addCustomerBtn.addEventListener('click', () => {
        document.getElementById('customerForm').reset();
        addCustomerModal.show();
    });
    
    saveCustomerBtn.addEventListener('click', saveCustomer);
    
    searchCustomer.addEventListener('input', filterCustomers);
    customerFilter.addEventListener('change', filterCustomers);
    
    downloadInvoiceBtn.addEventListener('click', downloadInvoice);
    editCustomerBtn.addEventListener('click', editCustomer);
    deleteCustomerBtn.addEventListener('click', deleteCustomer);
}

function loadCustomers() {
    db.collection('customers').where('userId', '==', currentUser.uid)
        .get()
        .then(querySnapshot => {
            customers = [];
            querySnapshot.forEach(doc => {
                const customer = doc.data();
                customer.id = doc.id;
                customers.push(customer);
            });
            
            updateCustomerCounts();
            renderCustomersTable(customers);
        })
        .catch(error => {
            console.error("Error loading customers: ", error);
            alert("Error loading customers. Please try again.");
        });
}

function updateCustomerCounts() {
    totalCustomersElement.textContent = customers.length;
    
    const activeCount = customers.filter(c => c.status === 'active').length;
    activeCustomersElement.textContent = activeCount;
    
    const thisMonth = new Date().getMonth();
    const newCount = customers.filter(c => {
        const joinDate = c.joinDate ? c.joinDate.toDate() : new Date();
        return joinDate.getMonth() === thisMonth;
    }).length;
    newCustomersElement.textContent = newCount;
}

function renderCustomersTable(customersToRender) {
    customersTableBody.innerHTML = '';
    
    if (customersToRender.length === 0) {
        customersTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">No customers found</td>
            </tr>
        `;
        return;
    }
    
    customersToRender.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.id.substring(0, 8)}...</td>
            <td>${customer.firstName} ${customer.lastName}</td>
            <td>${customer.email}</td>
            <td>${customer.phone || 'N/A'}</td>
            <td>${customer.joinDate ? customer.joinDate.toDate().toLocaleDateString() : 'N/A'}</td>
            <td>
                <span class="badge ${customer.status === 'active' ? 'bg-success' : 'bg-secondary'}">
                    ${customer.status || 'inactive'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-info view-btn" data-id="${customer.id}">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
        `;
        customersTableBody.appendChild(row);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const customerId = e.currentTarget.getAttribute('data-id');
            viewCustomerDetails(customerId);
        });
    });
}

function filterCustomers() {
    const searchTerm = searchCustomer.value.toLowerCase();
    const filterValue = customerFilter.value;
    
    let filteredCustomers = customers.filter(customer => {
        const matchesSearch = 
            customer.firstName.toLowerCase().includes(searchTerm) ||
            customer.lastName.toLowerCase().includes(searchTerm) ||
            customer.email.toLowerCase().includes(searchTerm) ||
            (customer.phone && customer.phone.includes(searchTerm));
        
        let matchesFilter = true;
        if (filterValue === 'active') {
            matchesFilter = customer.status === 'active';
        } else if (filterValue === 'inactive') {
            matchesFilter = customer.status !== 'active';
        } else if (filterValue === 'recent') {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            matchesFilter = customer.joinDate && customer.joinDate.toDate() > oneMonthAgo;
        }
        
        return matchesSearch && matchesFilter;
    });
    
    renderCustomersTable(filteredCustomers);
}

function saveCustomer() {
    const customerData = {
        userId: currentUser.uid,
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim(),
        city: document.getElementById('city').value.trim(),
        state: document.getElementById('state').value.trim(),
        zipCode: document.getElementById('zipCode').value.trim(),
        customerType: document.getElementById('customerType').value,
        status: document.getElementById('status').value,
        notes: document.getElementById('notes').value.trim(),
        joinDate: new Date()
    };
    
    // Basic validation
    if (!customerData.firstName || !customerData.lastName || !customerData.email) {
        alert('Please fill in all required fields (marked with *)');
        return;
    }
    
    db.collection('customers').add(customerData)
        .then(() => {
            addCustomerModal.hide();
            loadCustomers();
            alert('Customer added successfully!');
        })
        .catch(error => {
            console.error("Error adding customer: ", error);
            alert("Error adding customer. Please try again.");
        });
}

function viewCustomerDetails(customerId) {
    currentCustomerId = customerId;
    const customer = customers.find(c => c.id === customerId);
    
    if (!customer) return;
    
    // Set modal title
    document.getElementById('detailModalTitle').textContent = `${customer.firstName} ${customer.lastName}'s Details`;
    
    // Set basic info
    document.getElementById('detailFullName').textContent = `${customer.firstName} ${customer.lastName}`;
    document.getElementById('detailEmail').textContent = customer.email || 'N/A';
    document.getElementById('detailPhone').textContent = customer.phone || 'N/A';
    document.getElementById('detailAddress').textContent = customer.address || 'N/A';
    
    const cityStateZip = [];
    if (customer.city) cityStateZip.push(customer.city);
    if (customer.state) cityStateZip.push(customer.state);
    if (customer.zipCode) cityStateZip.push(customer.zipCode);
    document.getElementById('detailCityStateZip').textContent = cityStateZip.join(', ') || 'N/A';
    
    document.getElementById('detailJoinDate').textContent = 
        customer.joinDate ? customer.joinDate.toDate().toLocaleDateString() : 'N/A';
    
    const statusBadge = document.getElementById('detailStatus');
    statusBadge.textContent = customer.status || 'inactive';
    statusBadge.className = `badge ${customer.status === 'active' ? 'bg-success' : 'bg-secondary'}`;
    
    document.getElementById('detailType').textContent = customer.customerType || 'regular';
    document.getElementById('detailNotes').textContent = customer.notes || 'No notes available.';
    
    // Load order history (placeholder - you would implement this based on your orders collection)
    loadCustomerOrderHistory(customerId);
    
    customerDetailModal.show();
}

function loadCustomerOrderHistory(customerId) {
    // This is a placeholder - implement based on your orders collection
    const orderHistoryBody = document.getElementById('orderHistoryBody');
    orderHistoryBody.innerHTML = `
        <tr>
            <td colspan="5" class="text-center">Loading order history...</td>
        </tr>
    `;
    
    db.collection('orders').where('customerId', '==', customerId)
        .orderBy('orderDate', 'desc')
        .limit(5)
        .get()
        .then(querySnapshot => {
            if (querySnapshot.empty) {
                orderHistoryBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center">No orders found for this customer</td>
                    </tr>
                `;
                return;
            }
            
            orderHistoryBody.innerHTML = '';
            let totalSpending = 0;
            let lastOrderDate = null;
            
            querySnapshot.forEach(doc => {
                const order = doc.data();
                const orderDate = order.orderDate ? order.orderDate.toDate() : new Date();
                const orderAmount = order.totalAmount || 0;
                
                totalSpending += orderAmount;
                
                if (!lastOrderDate || orderDate > lastOrderDate) {
                    lastOrderDate = orderDate;
                }
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${doc.id.substring(0, 8)}...</td>
                    <td>${orderDate.toLocaleDateString()}</td>
                    <td>$${orderAmount.toFixed(2)}</td>
                    <td><span class="badge ${order.status === 'completed' ? 'bg-success' : 'bg-warning'}">
                        ${order.status || 'pending'}
                    </span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary view-order-btn" data-id="${doc.id}">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                `;
                orderHistoryBody.appendChild(row);
            });
            
            // Update stats
            document.getElementById('detailTotalOrders').textContent = querySnapshot.size;
            document.getElementById('detailTotalSpending').textContent = `$${totalSpending.toFixed(2)}`;
            document.getElementById('detailLastOrder').textContent = 
                lastOrderDate ? lastOrderDate.toLocaleDateString() : 'Never';
        })
        .catch(error => {
            console.error("Error loading order history: ", error);
            orderHistoryBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">Error loading order history</td>
                </tr>
            `;
        });
}

function downloadInvoice() {
    if (!currentCustomerId) return;
    
    // This is a placeholder - implement based on your invoice generation logic
    alert(`Downloading invoice for customer ${currentCustomerId}`);
    // You would typically generate a PDF here using a library like jsPDF
    // or trigger a server-side function to generate the invoice
}

function editCustomer() {
    if (!currentCustomerId) return;
    
    const customer = customers.find(c => c.id === currentCustomerId);
    if (!customer) return;
    
    // Populate the form with customer data
    document.getElementById('firstName').value = customer.firstName || '';
    document.getElementById('lastName').value = customer.lastName || '';
    document.getElementById('email').value = customer.email || '';
    document.getElementById('phone').value = customer.phone || '';
    document.getElementById('address').value = customer.address || '';
    document.getElementById('city').value = customer.city || '';
    document.getElementById('state').value = customer.state || '';
    document.getElementById('zipCode').value = customer.zipCode || '';
    document.getElementById('customerType').value = customer.customerType || 'regular';
    document.getElementById('status').value = customer.status || 'active';
    document.getElementById('notes').value = customer.notes || '';
    
    // Change the save button to update
    saveCustomerBtn.textContent = 'Update Customer';
    saveCustomerBtn.onclick = updateCustomer;
    
    customerDetailModal.hide();
    addCustomerModal.show();
}

function updateCustomer() {
    const updatedData = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim(),
        city: document.getElementById('city').value.trim(),
        state: document.getElementById('state').value.trim(),
        zipCode: document.getElementById('zipCode').value.trim(),
        customerType: document.getElementById('customerType').value,
        status: document.getElementById('status').value,
        notes: document.getElementById('notes').value.trim()
    };
    
    db.collection('customers').doc(currentCustomerId).update(updatedData)
        .then(() => {
            addCustomerModal.hide();
            loadCustomers();
            alert('Customer updated successfully!');
            
            // Reset the save button
            saveCustomerBtn.textContent = 'Save Customer';
            saveCustomerBtn.onclick = saveCustomer;
        })
        .catch(error => {
            console.error("Error updating customer: ", error);
            alert("Error updating customer. Please try again.");
        });
}

function deleteCustomer() {
    if (!currentCustomerId) return;
    
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
        return;
    }
    
    db.collection('customers').doc(currentCustomerId).delete()
        .then(() => {
            customerDetailModal.hide();
            loadCustomers();
            alert('Customer deleted successfully!');
        })
        .catch(error => {
            console.error("Error deleting customer: ", error);
            alert("Error deleting customer. Please try again.");
        });
}