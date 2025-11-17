// Global Variables
let items = [];
let currentFilter = 'all';
let editingId = null;
let currentUser = null;

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadItems();
});

// Check if user is authenticated
function checkAuth() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    currentUser = username;
    document.getElementById('username').textContent = username;
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.href = 'login.html';
    }
}

// Load Items from Backend
async function loadItems() {
    try {
        const response = await fetch('http://localhost:3000/api/items', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            items = await response.json();
            renderItems();
            updateStats();
        } else {
            showMessage('Failed to load items', 'error');
        }
    } catch (error) {
        console.error('Error loading items:', error);
        showMessage('Error loading items', 'error');
    }
}

// Render Items in Table
function renderItems() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';
    
    // Filter items
    let filteredItems = items;
    if (currentFilter !== 'all') {
        filteredItems = items.filter(item => item.status === currentFilter);
    }
    
    if (filteredItems.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #6b7280;">
                    No items found. Add your first grocery item!
                </td>
            </tr>
        `;
        return;
    }
    
    // Group by category
    const grouped = {};
    filteredItems.forEach(item => {
        if (!grouped[item.category]) {
            grouped[item.category] = [];
        }
        grouped[item.category].push(item);
    });
    
    // Render grouped items
    Object.keys(grouped).forEach(category => {
        // Category header
        tableBody.innerHTML += `
            <tr class="category-header">
                <td colspan="6">${category} (${grouped[category].length})</td>
            </tr>
        `;
        
        // Items in category
        grouped[category].forEach(item => {
            const row = document.createElement('tr');
            if (item.status === 'completed') {
                row.classList.add('completed');
            }
            
            row.innerHTML = `
                <td>
                    <input type="checkbox" 
                           class="status-checkbox" 
                           ${item.status === 'completed' ? 'checked' : ''} 
                           onchange="toggleStatus('${item._id}')">
                </td>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>${item.price.toLocaleString()}</td>
                <td>${item.quantity}</td>
                <td>
                    <button class="action-btn btn-edit" onclick="editItem('${item._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn btn-delete" onclick="deleteItem('${item._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    });
}

// Update Statistics
function updateStats() {
    const total = items.length;
    const completed = items.filter(i => i.status === 'completed').length;
    const active = items.filter(i => i.status === 'active').length;
    
    document.getElementById('totalItems').textContent = total;
    document.getElementById('completedItems').textContent = completed;
    document.getElementById('activeItems').textContent = active;
}

// Show Add Form
function showAddForm() {
    document.getElementById('formTitle').textContent = 'Add New Item';
    document.getElementById('formSection').classList.add('active');
    document.querySelector('.content-grid').classList.add('with-form');
    clearFormErrors();
    resetForm();
    editingId = null;
}

// Cancel Form
function cancelForm() {
    document.getElementById('formSection').classList.remove('active');
    document.querySelector('.content-grid').classList.remove('with-form');
    resetForm();
    editingId = null;
}

// Reset Form
function resetForm() {
    document.getElementById('itemName').value = '';
    document.getElementById('category').value = '';
    document.getElementById('price').value = '';
    document.getElementById('quantity').value = '';
    clearFormErrors();
}

// Save Item (Add or Update)
async function saveItem() {
    // Get form values
    const name = document.getElementById('itemName').value.trim();
    const category = document.getElementById('category').value;
    const price = document.getElementById('price').value;
    const quantity = document.getElementById('quantity').value;
    
    // Validate
    if (!validateForm(name, category, price, quantity)) {
        return;
    }
    
    const itemData = { name, category, price: Number(price), quantity: Number(quantity) };
    
    try {
        let response;
        if (editingId) {
            // Update existing item
            response = await fetch(`http://localhost:3000/api/items/${editingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(itemData)
            });
            
            if (response.ok) {
                showMessage('Item updated successfully!', 'success');
            }
        } else {
            // Add new item
            response = await fetch('http://localhost:3000/api/items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(itemData)
            });
            
            if (response.ok) {
                showMessage('Item added successfully!', 'success');
            }
        }
        
        if (response.ok) {
            await loadItems();
            cancelForm();
        } else {
            showMessage('Failed to save item', 'error');
        }
    } catch (error) {
        console.error('Error saving item:', error);
        showMessage('Error saving item', 'error');
    }
}

// Edit Item
function editItem(id) {
    const item = items.find(i => i._id === id);
    if (!item) return;
    
    document.getElementById('formTitle').textContent = 'Edit Item';
    document.getElementById('itemName').value = item.name;
    document.getElementById('category').value = item.category;
    document.getElementById('price').value = item.price;
    document.getElementById('quantity').value = item.quantity;
    
    editingId = id;
    showAddForm();
}

// Delete Item
async function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) {
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3000/api/items/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            showMessage('Item deleted successfully!', 'success');
            await loadItems();
        } else {
            showMessage('Failed to delete item', 'error');
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        showMessage('Error deleting item', 'error');
    }
}

// Toggle Status
async function toggleStatus(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/items/${id}/toggle`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            await loadItems();
        } else {
            showMessage('Failed to update status', 'error');
        }
    } catch (error) {
        console.error('Error toggling status:', error);
        showMessage('Error updating status', 'error');
    }
}

// Filter Items
function filterItems(filter) {
    currentFilter = filter;
    
    // Update button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`filter${filter.charAt(0).toUpperCase() + filter.slice(1)}`).classList.add('active');
    
    renderItems();
}

// Clear Completed
async function clearCompleted() {
    const completed = items.filter(i => i.status === 'completed');
    
    if (completed.length === 0) {
        showMessage('No completed items to clear', 'error');
        return;
    }
    
    if (!confirm(`Clear ${completed.length} completed item(s)?`)) {
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3000/api/items/clear-completed', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            showMessage('Completed items cleared!', 'success');
            await loadItems();
        } else {
            showMessage('Failed to clear items', 'error');
        }
    } catch (error) {
        console.error('Error clearing completed:', error);
        showMessage('Error clearing items', 'error');
    }
}

// Clear All
async function clearAll() {
    if (items.length === 0) {
        showMessage('No items to clear', 'error');
        return;
    }
    
    if (!confirm('Are you sure you want to clear ALL items? This cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3000/api/items/clear-all', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            showMessage('All items cleared!', 'success');
            await loadItems();
        } else {
            showMessage('Failed to clear items', 'error');   // <-- FIXED LINE
        }
    } catch (error) {
        console.error('Error clearing all items:', error);
        showMessage('Error clearing items', 'error');
    }
}
