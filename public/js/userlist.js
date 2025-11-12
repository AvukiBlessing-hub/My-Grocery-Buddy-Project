const usersTableBody = document.querySelector("#usersTable tbody");

// Load users from localStorage
let users = JSON.parse(localStorage.getItem("users")) || [];

// Function to render table
function renderUsers() {
  usersTableBody.innerHTML = "";
  users.forEach((user, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editUser(${index})">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteUser(${index})">Delete</button>
            </td>
        `;
    usersTableBody.appendChild(row);
  });
}

// Delete user
function deleteUser(index) {
  if (confirm("Are you sure you want to delete this user?")) {
    users.splice(index, 1);
    localStorage.setItem("users", JSON.stringify(users));
    renderUsers();
  }
}

// Edit user
function editUser(index) {
  const user = users[index];
  const newName = prompt("Edit Name:", user.name);
  if (newName === null) return; // Cancelled
  const newEmail = prompt("Edit Email:", user.email);
  if (newEmail === null) return;

  users[index] = {
    name: newName,
    email: newEmail,
  };

  localStorage.setItem("users", JSON.stringify(users));
  renderUsers();
}

// Initial render
renderUsers();
