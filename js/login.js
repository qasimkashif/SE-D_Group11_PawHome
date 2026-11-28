/*
  js/login.js
  NOTE: This login system is a client-side simulation only (using browser
  localStorage) and is NOT secure for real applications because passwords are
  stored in plain text on the user's device.
*/

// Exact localStorage keys shared across Paw Home
const USERS_KEY = 'ph_users';
const CURRENT_USER_KEY = 'ph_user';
const REMEMBER_EMAIL_KEY = 'ph_remember_email';

// --- Storage Helpers (with safe JSON parsing) ---

/**
 * Reads the saved accounts array from localStorage (ph_users).
 * If missing or corrupted JSON, resets ph_users to [] and returns [].
 */
function getUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    // Corrupted JSON falls through to reset below
  }

  localStorage.setItem(USERS_KEY, JSON.stringify([]));
  return [];
}

/**
 * Saves the updated accounts array into localStorage (ph_users).
 */
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/**
 * Reads the currently signed-in user object from localStorage (ph_user).
 * Returns null if no valid session is saved.
 */
function getCurrentUser() {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.email) {
      return parsed;
    }
  } catch (error) {
    // Ignore corrupted session data and treat as logged out
  }

  localStorage.removeItem(CURRENT_USER_KEY);
  return null;
}

/**
 * Saves the active user session in localStorage (ph_user) as { name, email }.
 */
function setCurrentUser(user) {
  const sessionUser = {
    name: user.name,
    email: user.email
  };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
}

/**
 * Clears the current session from localStorage (ph_user).
 */
function clearCurrentUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

/**
 * Reads or updates the remembered login email (ph_remember_email).
 */
function getRememberedEmail() {
  return localStorage.getItem(REMEMBER_EMAIL_KEY) || '';
}

function saveRememberedEmail(email, shouldRemember) {
  if (shouldRemember && email) {
    localStorage.setItem(REMEMBER_EMAIL_KEY, email);
  } else {
    localStorage.removeItem(REMEMBER_EMAIL_KEY);
  }
}

// --- UI Error & Message Helpers ---

/**
 * Shows or clears an inline error message below a form input.
 */
function setFieldError(inputEl, errorEl, message) {
  if (!errorEl) return;
  errorEl.textContent = message;
  if (inputEl) {
    inputEl.classList.toggle('is-invalid-field', Boolean(message));
  }
}

/**
 * Shows or clears a form-level status message (error or success).
 */
function setFormMessage(messageEl, message, type) {
  if (!messageEl) return;
  messageEl.textContent = message;
  messageEl.classList.remove('is-error', 'is-success');
  if (type === 'error') {
    messageEl.classList.add('is-error');
  } else if (type === 'success') {
    messageEl.classList.add('is-success');
  }
}

/**
 * Checks whether an email string looks like a valid email address.
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// --- Password Visibility Toggle ---

/**
 * Toggles a password input between hidden ("password") and visible ("text").
 */
function handleTogglePassword(button) {
  const targetId = button.getAttribute('data-target');
  const input = document.getElementById(targetId);
  if (!input) return;

  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  button.setAttribute('aria-pressed', String(isHidden));
  button.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
}

// --- Password Strength Meter ---

/**
 * Scores a password from 0 to 5 using five rules:
 * length >= 8, lowercase, uppercase, digit, and symbol.
 */
function evaluatePasswordStrength(password) {
  if (!password) {
    return { score: 0, level: 'Empty', width: '0%', label: '', className: '', valueNow: 0 };
  }

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) {
    return {
      score: score,
      level: 'Weak',
      width: '33%',
      label: 'Weak — Use 8+ characters, a number and a symbol',
      className: 'strength-weak',
      valueNow: 33
    };
  }

  if (score <= 4) {
    return {
      score: score,
      level: 'Medium',
      width: '66%',
      label: 'Medium',
      className: 'strength-medium',
      valueNow: 66
    };
  }

  return {
    score: score,
    level: 'Strong',
    width: '100%',
    label: 'Strong',
    className: 'strength-strong',
    valueNow: 100
  };
}

/**
 * Updates the strength bar, label text, and Create Account button state live.
 */
function updateStrengthMeter() {
  const passwordInput = document.getElementById('signup-password');
  const trackEl = document.getElementById('signup-strength-track');
  const fillEl = document.getElementById('signup-strength-fill');
  const textEl = document.getElementById('signup-strength-text');
  const submitBtn = document.getElementById('signup-submit-btn');

  const result = evaluatePasswordStrength(passwordInput.value);

  fillEl.style.width = result.width;
  fillEl.classList.remove('strength-weak', 'strength-medium', 'strength-strong');
  textEl.classList.remove('strength-weak', 'strength-medium', 'strength-strong');

  if (result.className) {
    fillEl.classList.add(result.className);
    textEl.classList.add(result.className);
  }

  textEl.textContent = result.label;
  trackEl.setAttribute('aria-valuenow', String(result.valueNow));

  // Disable "Create Account" while the password is Weak
  submitBtn.disabled = result.level === 'Weak';
}

// --- View Switching (Auth Forms vs Logged-In View) ---

/**
 * Switches the card to show the logged-in view with the user's name.
 */
function showLoggedInView(user, customMessage) {
  const authView = document.getElementById('auth-view');
  const loggedInView = document.getElementById('logged-in-view');
  const nameEl = document.getElementById('logged-in-name');
  const textEl = document.getElementById('logged-in-text');

  nameEl.textContent = user.name || 'Friend';
  if (customMessage) {
    textEl.textContent = customMessage;
  } else {
    textEl.textContent =
      'You are signed in to Paw Home Islamabad. Explore available pets or manage your saved favourites.';
  }

  authView.classList.add('d-none');
  loggedInView.classList.remove('d-none');
}

/**
 * Switches the card back to the Login / Sign Up tabs and pre-fills remembered email.
 */
function showAuthView() {
  const authView = document.getElementById('auth-view');
  const loggedInView = document.getElementById('logged-in-view');

  loggedInView.classList.add('d-none');
  authView.classList.remove('d-none');
  prefillRememberedEmail();
}

/**
 * Pre-fills the login email field if ph_remember_email is saved.
 */
function prefillRememberedEmail() {
  const emailInput = document.getElementById('login-email');
  const rememberCheckbox = document.getElementById('login-remember');
  const savedEmail = getRememberedEmail();

  if (savedEmail) {
    emailInput.value = savedEmail;
    rememberCheckbox.checked = true;
  } else {
    rememberCheckbox.checked = false;
  }
}

// --- Form Submission Handlers ---

/**
 * Validates and submits the Sign Up form, creating a new account in ph_users.
 */
function handleSignupSubmit(event) {
  event.preventDefault();

  const nameInput = document.getElementById('signup-name');
  const emailInput = document.getElementById('signup-email');
  const passwordInput = document.getElementById('signup-password');
  const confirmInput = document.getElementById('signup-confirm-password');

  const nameError = document.getElementById('signup-name-error');
  const emailError = document.getElementById('signup-email-error');
  const passwordError = document.getElementById('signup-password-error');
  const confirmError = document.getElementById('signup-confirm-password-error');
  const formMessage = document.getElementById('signup-form-message');

  // Clear old messages
  setFieldError(nameInput, nameError, '');
  setFieldError(emailInput, emailError, '');
  setFieldError(passwordInput, passwordError, '');
  setFieldError(confirmInput, confirmError, '');
  setFormMessage(formMessage, '', '');

  const name = nameInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;
  const confirmPassword = confirmInput.value;
  const strength = evaluatePasswordStrength(password);

  let hasError = false;

  if (!name) {
    setFieldError(nameInput, nameError, 'Please enter your full name.');
    hasError = true;
  }

  if (!email) {
    setFieldError(emailInput, emailError, 'Please enter your email address.');
    hasError = true;
  } else if (!isValidEmail(email)) {
    setFieldError(emailInput, emailError, 'Please enter a valid email address.');
    hasError = true;
  }

  if (!password) {
    setFieldError(passwordInput, passwordError, 'Please enter a password.');
    hasError = true;
  } else if (strength.level === 'Weak') {
    setFieldError(passwordInput, passwordError, 'Use 8+ characters, a number and a symbol');
    hasError = true;
  }

  if (!confirmPassword) {
    setFieldError(confirmInput, confirmError, 'Please confirm your password.');
    hasError = true;
  } else if (password !== confirmPassword) {
    setFieldError(confirmInput, confirmError, 'Passwords do not match');
    hasError = true;
  }

  const users = getUsers();
  const duplicate = users.some(function (user) {
    return (user.email || '').trim().toLowerCase() === email;
  });

  if (email && isValidEmail(email) && duplicate) {
    setFieldError(emailInput, emailError, 'This email is already registered');
    hasError = true;
  }

  if (hasError) {
    return;
  }

  const newUser = {
    name: name,
    email: email,
    password: password
  };

  users.push(newUser);
  saveUsers(users);
  setCurrentUser(newUser);

  setFormMessage(formMessage, 'Account created!', 'success');
  document.getElementById('signup-form').reset();
  updateStrengthMeter();

  showLoggedInView(
    { name: newUser.name, email: newUser.email },
    'Account created! You are now signed in to Paw Home Islamabad.'
  );
}

/**
 * Validates and submits the Login form against ph_users.
 */
function handleLoginSubmit(event) {
  event.preventDefault();

  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const rememberCheckbox = document.getElementById('login-remember');

  const emailError = document.getElementById('login-email-error');
  const passwordError = document.getElementById('login-password-error');
  const formMessage = document.getElementById('login-form-message');

  // Clear old messages
  setFieldError(emailInput, emailError, '');
  setFieldError(passwordInput, passwordError, '');
  setFormMessage(formMessage, '', '');

  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  let hasError = false;

  if (!email) {
    setFieldError(emailInput, emailError, 'Please enter your email address.');
    hasError = true;
  }

  if (!password) {
    setFieldError(passwordInput, passwordError, 'Please enter your password.');
    hasError = true;
  }

  if (hasError) {
    return;
  }

  const users = getUsers();
  const matchedUser = users.find(function (user) {
    const storedEmail = (user.email || '').trim().toLowerCase();
    return storedEmail === email && user.password === password;
  });

  if (!matchedUser) {
    setFormMessage(formMessage, 'Incorrect email or password', 'error');
    return;
  }

  saveRememberedEmail(email, rememberCheckbox.checked);
  setCurrentUser(matchedUser);

  passwordInput.value = '';
  showLoggedInView({ name: matchedUser.name, email: matchedUser.email });
}

/**
 * Logs out the current user and returns to the Login / Sign Up view.
 */
function handleLogout() {
  clearCurrentUser();

  document.getElementById('login-form').reset();
  document.getElementById('signup-form').reset();
  setFormMessage(document.getElementById('login-form-message'), '', '');
  setFormMessage(document.getElementById('signup-form-message'), '', '');
  updateStrengthMeter();

  showAuthView();
}

// --- Page Initialization ---

/**
 * Connects all event listeners and checks if a user is already signed in.
 */
function initLoginPage() {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const signupPassword = document.getElementById('signup-password');
  const logoutBtn = document.getElementById('logout-btn');
  const toggleButtons = document.querySelectorAll('.toggle-password-btn');

  toggleButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      handleTogglePassword(button);
    });
  });

  signupPassword.addEventListener('input', updateStrengthMeter);
  signupForm.addEventListener('submit', handleSignupSubmit);
  loginForm.addEventListener('submit', handleLoginSubmit);
  logoutBtn.addEventListener('click', handleLogout);

  // Check if a session already exists on page load
  const currentUser = getCurrentUser();
  if (currentUser) {
    showLoggedInView(currentUser);
  } else {
    prefillRememberedEmail();
  }
}

document.addEventListener('DOMContentLoaded', initLoginPage);
