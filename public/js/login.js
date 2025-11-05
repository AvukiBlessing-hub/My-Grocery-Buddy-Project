// Get elements
const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const successMessage = document.getElementById("successMessage");
const togglePassword = document.getElementById("togglePassword");


// Toggle Password Visibility

togglePassword.addEventListener("click", function () {
  const type =
    passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);

  // Keep the same simple eye icon — no emoji switch
  this.innerHTML = "&#128065;";
});


// Email Validation Function

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}


// Clear Error on Input

emailInput.addEventListener("input", function () {
  emailInput.classList.remove("error", "success");
  emailError.classList.remove("show");
});

passwordInput.addEventListener("input", function () {
  passwordInput.classList.remove("error", "success");
  passwordError.classList.remove("show");
});


//  Form Submission Handling

form.addEventListener("submit", function (e) {
  e.preventDefault();
  let isValid = true;

  // Reset visual states
  emailInput.classList.remove("error", "success");
  passwordInput.classList.remove("error", "success");
  emailError.classList.remove("show");
  passwordError.classList.remove("show");
  successMessage.classList.remove("show");

  // Validate Email
  if (emailInput.value.trim() === "") {
    emailInput.classList.add("error");
    emailError.textContent = "Email is required";
    emailError.classList.add("show");
    isValid = false;
  } else if (!validateEmail(emailInput.value.trim())) {
    emailInput.classList.add("error");
    emailError.textContent = "Please enter a valid email address";
    emailError.classList.add("show");
    isValid = false;
  } else {
    emailInput.classList.add("success");
  }

  // Validate Password
  if (passwordInput.value === "") {
    passwordInput.classList.add("error");
    passwordError.textContent = "Password is required";
    passwordError.classList.add("show");
    isValid = false;
  } else if (passwordInput.value.length < 6) {
    passwordInput.classList.add("error");
    passwordError.textContent = "Password must be at least 6 characters";
    passwordError.classList.add("show");
    isValid = false;
  } else {
    passwordInput.classList.add("success");
  }

  // If valid, show success message
  if (isValid) {
    successMessage.classList.add("show");

    // Simulate redirect after 2 seconds
    setTimeout(() => {
      console.log("Login successful with:", {
        email: emailInput.value,
        password: passwordInput.value,
      });
      // Redirect example:
      // window.location.href = 'dashboard.html';
    }, 2000);
  }
});
