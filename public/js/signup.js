const form = document.getElementById("registrationForm");
const username = document.getElementById("username");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

// Real-time validation
username.addEventListener("blur", () => validateUsername());
email.addEventListener("blur", () => validateEmail());
password.addEventListener("blur", () => validatePassword());
confirmPassword.addEventListener("blur", () => validateConfirmPassword());

// Clear error on input - also revalidate confirm password when password changes

username.addEventListener("input", () => clearError(username, "usernameError"));
email.addEventListener("input", () => clearError(email, "emailError"));
password.addEventListener("input", () => {
  clearError(password, "passwordError");
  if (confirmPassword.value !== "") {

    validateConfirmPassword();
  }
});
confirmPassword.addEventListener("input", () =>
  clearError(confirmPassword, "confirmPasswordError")
);

// Submit event
form.addEventListener("submit", function (event) {

  // Run all validations
  const isUsernameValid = validateUsername();
  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();
  const isConfirmPasswordValid = validateConfirmPassword();

  // Only prevent submission if validation fails

  if (
    !(
      isUsernameValid &&
      isEmailValid &&
      isPasswordValid &&
      isConfirmPasswordValid
    )
  ) {
    event.preventDefault(); // stop submission if invalid
  } else {
    showSuccessPopup();


  }
});
