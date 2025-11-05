const form = document.getElementById('registrationForm');
const username = document.getElementById('username');
const email = document.getElementById('email');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');

// Real-time validation
username.addEventListener('blur', () => validateUsername());
email.addEventListener('blur', () => validateEmail());
password.addEventListener('blur', () => validatePassword());
confirmPassword.addEventListener('blur', () => validateConfirmPassword());

// Clear error on input - also revalidate confirm password when password changes
username.addEventListener('input', () => clearError(username, 'usernameError'));
email.addEventListener('input', () => clearError(email, 'emailError'));
password.addEventListener('input', () => {
  clearError(password, 'passwordError');
  // Revalidate confirm password if it has a value
  if (confirmPassword.value !== '') {
    validateConfirmPassword();
  }
});
confirmPassword.addEventListener('input', () => clearError(confirmPassword, 'confirmPasswordError'));

form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const isUsernameValid = validateUsername();
  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();
  const isConfirmPasswordValid = validateConfirmPassword();

  if (isUsernameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid) {
    showSuccessPopup();
    setTimeout(() => {
      form.reset();
      clearAllValidations();
    }, 500);
  }
});

function validateUsername() {
  const value = username.value.trim();
  const errorElement = document.getElementById('usernameError');

  if (value === '') {
    showError(username, errorElement, 'Username is required');
    return false;
  } else if (value.length < 3) {
    showError(username, errorElement, 'Username must be at least 3 characters');
    return false;
  } else if (value.length > 30) {
    showError(username, errorElement, 'Username must be less than 30 characters');
    return false;
  } else if (!/^[a-zA-Z0-9_ ]+$/.test(value)) {
    showError(username, errorElement, 'Username can only contain letters, numbers, spaces, and underscores');
    return false;
  } else {
    showSuccess(username, errorElement);
    return true;
  }
}

function validateEmail() {
  const value = email.value.trim();
  const errorElement = document.getElementById('emailError');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (value === '') {
    showError(email, errorElement, 'Email is required');
    return false;
  } else if (!emailRegex.test(value)) {
    showError(email, errorElement, 'Please enter a valid email address');
    return false;
  } else {
    showSuccess(email, errorElement);
    return true;
  }
}

function validatePassword() {
  const value = password.value;
  const errorElement = document.getElementById('passwordError');

  if (value === '') {
    showError(password, errorElement, 'Password is required');
    return false;
  } else if (value.length < 6) {
    showError(password, errorElement, 'Password must be at least 6 characters');
    return false;
  } else {
    showSuccess(password, errorElement);
    return true;
  }
}

function validateConfirmPassword() {
  const value = confirmPassword.value;
  const errorElement = document.getElementById('confirmPasswordError');

  if (value === '') {
    showError(confirmPassword, errorElement, 'Please confirm your password');
    return false;
  } else if (value !== password.value) {
    showError(confirmPassword, errorElement, 'Passwords do not match');
    return false;
  } else {
    showSuccess(confirmPassword, errorElement);
    return true;
  }
}

function showError(input, errorElement, message) {
  input.classList.add('error');
  input.classList.remove('success');
  errorElement.textContent = message;
  errorElement.classList.add('show');
}

function showSuccess(input, errorElement) {
  input.classList.remove('error');
  input.classList.add('success');
  errorElement.classList.remove('show');
  errorElement.textContent = '';
}

function clearError(input, errorElementId) {
  const errorElement = document.getElementById(errorElementId);
  input.classList.remove('error');
  input.classList.remove('success');
  errorElement.classList.remove('show');
  errorElement.textContent = '';
}

function clearAllValidations() {
  const inputs = [username, email, password, confirmPassword];
  const errorIds = ['usernameError', 'emailError', 'passwordError', 'confirmPasswordError'];
  
  inputs.forEach((input, index) => {
    input.classList.remove('error', 'success');
    const errorElement = document.getElementById(errorIds[index]);
    errorElement.classList.remove('show');
    errorElement.textContent = '';
  });
}

function showSuccessPopup() {
  const popup = document.getElementById('successPopup');
  const overlay = document.getElementById('overlay');
  
  popup.classList.add('show');
  overlay.classList.add('show');

  setTimeout(() => {
    popup.classList.remove('show');
    overlay.classList.remove('show');
  }, 3000);
} 