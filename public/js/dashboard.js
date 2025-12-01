let items = [];
let currentFilter = 'all';
let editingId = null;

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadItems();
});

// Load Items from Backend
async function loadItems() {
    try {
        const response = await fetch('/api/items');
        
        if (response.ok) {
            items = await response.json();
            renderItems();
            updateStats();
        } else if (response.status === 401) {
            window.location.href = '/login';
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

// Clear Form Errors
function clearFormErrors() {
    document.getElementById('nameError').textContent = '';
    document.getElementById('categoryError').textContent = '';
    document.getElementById('priceError').textContent = '';
    document.getElementById('quantityError').textContent = '';
    
    document.getElementById('itemName').classList.remove('error');
    document.getElementById('category').classList.remove('error');
    document.getElementById('price').classList.remove('error');
    document.getElementById('quantity').classList.remove('error');
}

// Validate Form
function validateForm(name, category, price, quantity) {
    let isValid = true;
    clearFormErrors();
    
    if (!name || name.length < 2) {
        document.getElementById('nameError').textContent = 'Item name must be at least 2 characters';
        document.getElementById('itemName').classList.add('error');
        isValid = false;
    }
    
    if (!category) {
        document.getElementById('categoryError').textContent = 'Please select a category';
        document.getElementById('category').classList.add('error');
        isValid = false;
    }
    
    if (!price || price <= 0) {
        document.getElementById('priceError').textContent = 'Price must be greater than 0';
        document.getElementById('price').classList.add('error');
        isValid = false;
    }
    
    if (!quantity || quantity <= 0) {
        document.getElementById('quantityError').textContent = 'Quantity must be greater than 0';
        document.getElementById('quantity').classList.add('error');
        isValid = false;
    }
    
    return isValid;
}

// Save Item (Add or Update)
async function saveItem() {
    const name = document.getElementById('itemName').value.trim();
    const category = document.getElementById('category').value;
    const price = document.getElementById('price').value;
    const quantity = document.getElementById('quantity').value;
    
    if (!validateForm(name, category, price, quantity)) {
        return;
    }
    
    const itemData = { 
        name, 
        category, 
        price: Number(price), 
        quantity: Number(quantity) 
    };
    
    try {
        let response;
        if (editingId) {
            response = await fetch(`/api/items/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData)
            });
            
            if (response.ok) {
                showMessage('Item updated successfully!', 'success');
            }
        } else {
            response = await fetch('/api/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
            const data = await response.json();
            showMessage(data.message || 'Failed to save item', 'error');
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
        const response = await fetch(`/api/items/${id}`, {
            method: 'DELETE'
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
        const response = await fetch(`/api/items/${id}/toggle`, {
            method: 'PATCH'
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
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (filter === 'all') {
        document.getElementById('filterAll').classList.add('active');
    } else if (filter === 'active') {
        document.getElementById('filterActive').classList.add('active');
    } else if (filter === 'completed') {
        document.getElementById('filterCompleted').classList.add('active');
    }
    
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
        const response = await fetch('/api/items/clear-completed', {
            method: 'DELETE'
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
        const response = await fetch('/api/items/clear-all', {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showMessage('All items cleared!', 'success');
            await loadItems();
        } else {
            showMessage('Failed to clear all items', 'error');
        }
    } catch (error) {
        console.error('Error clearing all items:', error);
        showMessage('Error clearing items', 'error');
    }
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = '/logout';
    }
}

// Show Message
function showMessage(message, type) {
    const container = document.getElementById('messageContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer; font-size: 18px;">×</button>
    `;
    
    container.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}
function searchItems() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const rows = document.querySelectorAll("#tableBody tr");

  rows.forEach(row => {
    const itemName = row.querySelector("td:nth-child(2)").textContent.toLowerCase();
    const category = row.querySelector("td:nth-child(3)").textContent.toLowerCase();

    if (itemName.includes(input) || category.includes(input)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

function searchItems() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const tableBody = document.getElementById("tableBody");
  const rows = tableBody.getElementsByTagName("tr");

  for (let i = 0; i < rows.length; i++) {
    const itemName = rows[i].querySelector("td:nth-child(2)");
    const category = rows[i].querySelector("td:nth-child(3)");

    if (itemName && category) {
      const nameText = itemName.textContent.toLowerCase();
      const categoryText = category.textContent.toLowerCase();

      if (nameText.includes(input) || categoryText.includes(input)) {
        rows[i].style.display = "";
      } else {
        rows[i].style.display = "none";
      }
    }
  }
}

