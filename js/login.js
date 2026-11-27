/*
 * WARNING: Client-side simulation only.
 * This login and registration flow stores accounts and session data in browser
 * localStorage in plain text for demo purposes. It is NOT secure and must not
 * be used for real authentication or sensitive data.
 *
 * Note: ../js/storage.js and ../js/layout.js are not present in the repository
 * yet, so localStorage helpers are implemented locally below and ph_user is
 * stored as { name, email }.
 */

(function () {
  "use strict";

  const STORAGE_KEYS = {
    USERS: "ph_users",
    CURRENT_USER: "ph_user",
    REMEMBER_EMAIL: "ph_remember_email"
  };

  const WEAK_PASSWORD_HINT = "Use 8+ characters, a number and a symbol";
  const LOGIN_FAILURE_MESSAGE = "Incorrect email or password";
  const DUPLICATE_EMAIL_MESSAGE = "This email is already registered";
  const PASSWORD_MISMATCH_MESSAGE = "Passwords do not match";
  const ACCOUNT_CREATED_MESSAGE = "Account created!";

  const EYE_OPEN_SVG =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
    '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"></path>' +
    '<circle cx="12" cy="12" r="3"></circle>' +
    "</svg>";

  const EYE_CLOSED_SVG =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
    '<path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.77 21.77 0 0 1 5.06-5.94"></path>' +
    '<path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 7 11 7a21.77 21.77 0 0 1-2.16 3.19"></path>' +
    '<line x1="1" y1="1" x2="23" y2="23"></line>' +
    "</svg>";

  function readStorageValue(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function writeStorageValue(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      // Ignore storage quota or access errors in restricted environments.
    }
  }

  function removeStorageValue(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      // Ignore storage access errors in restricted environments.
    }
  }

  function getUsers() {
    const raw = readStorageValue(STORAGE_KEYS.USERS);
    if (!raw) {
      saveUsers([]);
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        saveUsers([]);
        return [];
      }
      return parsed;
    } catch (error) {
      saveUsers([]);
      return [];
    }
  }

  function saveUsers(users) {
    writeStorageValue(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  function getCurrentUser() {
    const raw = readStorageValue(STORAGE_KEYS.CURRENT_USER);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw);
      if (
        !parsed ||
        typeof parsed !== "object" ||
        typeof parsed.email !== "string" ||
        !parsed.email.trim()
      ) {
        clearCurrentUser();
        return null;
      }
      return {
        name: typeof parsed.name === "string" ? parsed.name : "",
        email: parsed.email
      };
    } catch (error) {
      clearCurrentUser();
      return null;
    }
  }

  function setCurrentUser(user) {
    const sessionUser = {
      name: user.name,
      email: user.email
    };
    writeStorageValue(STORAGE_KEYS.CURRENT_USER, JSON.stringify(sessionUser));
  }

  function clearCurrentUser() {
    removeStorageValue(STORAGE_KEYS.CURRENT_USER);
  }

  function normalizeEmail(email) {
    return typeof email === "string" ? email.trim().toLowerCase() : "";
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function getPasswordStrength(password) {
    const value = typeof password === "string" ? password : "";
    let score = 0;

    if (value.length >= 8) score += 1;
    if (/[a-z]/.test(value)) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/[0-9]/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;

    if (score <= 2) {
      return {
        score: score,
        level: "Weak",
        widthPercent: 33,
        cssClass: "strength-weak"
      };
    }

    if (score <= 4) {
      return {
        score: score,
        level: "Medium",
        widthPercent: 66,
        cssClass: "strength-medium"
      };
    }

    return {
      score: score,
      level: "Strong",
      widthPercent: 100,
      cssClass: "strength-strong"
    };
  }

  function setFieldError(inputEl, errorEl, message) {
    if (errorEl) {
      errorEl.textContent = message || "";
    }
    if (inputEl) {
      inputEl.classList.toggle("is-invalid-field", Boolean(message));
    }
  }

  function setFormMessage(messageEl, text, type) {
    if (!messageEl) {
      return;
    }
    messageEl.textContent = text || "";
    messageEl.classList.remove("is-error", "is-success");
    if (type === "error") {
      messageEl.classList.add("is-error");
    } else if (type === "success") {
      messageEl.classList.add("is-success");
    }
  }

  function updateStrengthMeter(password) {
    const track = document.getElementById("signup-strength-track");
    const fill = document.getElementById("signup-strength-fill");
    const textEl = document.getElementById("signup-strength-text");
    const passwordInput = document.getElementById("signup-password");
    const passwordErrorEl = document.getElementById("signup-password-error");
    const submitBtn = document.getElementById("signup-submit-btn");

    if (!track || !fill || !textEl) {
      return;
    }

    fill.classList.remove("strength-weak", "strength-medium", "strength-strong");
    textEl.classList.remove("strength-weak", "strength-medium", "strength-strong");

    if (!password) {
      fill.style.width = "0%";
      track.setAttribute("aria-valuenow", "0");
      textEl.textContent = "";
      if (passwordErrorEl) {
        passwordErrorEl.textContent = "";
      }
      if (passwordInput) {
        passwordInput.classList.remove("is-invalid-field");
      }
      if (submitBtn) {
        submitBtn.disabled = false;
      }
      return;
    }

    const strength = getPasswordStrength(password);
    fill.style.width = strength.widthPercent + "%";
    fill.classList.add(strength.cssClass);
    track.setAttribute("aria-valuenow", String(strength.widthPercent));

    textEl.textContent = strength.level;
    textEl.classList.add(strength.cssClass);

    if (strength.level === "Weak") {
      if (submitBtn) {
        submitBtn.disabled = true;
      }
      if (passwordErrorEl) {
        passwordErrorEl.textContent = WEAK_PASSWORD_HINT;
      }
      if (passwordInput) {
        passwordInput.classList.remove("is-invalid-field");
      }
    } else {
      if (submitBtn) {
        submitBtn.disabled = false;
      }
      if (passwordErrorEl) {
        passwordErrorEl.textContent = "";
      }
      if (passwordInput) {
        passwordInput.classList.remove("is-invalid-field");
      }
    }
  }

  function clearFormFeedback(formType) {
    if (formType === "login") {
      setFieldError(
        document.getElementById("login-email"),
        document.getElementById("login-email-error"),
        ""
      );
      setFieldError(
        document.getElementById("login-password"),
        document.getElementById("login-password-error"),
        ""
      );
      setFormMessage(document.getElementById("login-form-message"), "", "");
      return;
    }

    setFieldError(
      document.getElementById("signup-name"),
      document.getElementById("signup-name-error"),
      ""
    );
    setFieldError(
      document.getElementById("signup-email"),
      document.getElementById("signup-email-error"),
      ""
    );
    setFieldError(
      document.getElementById("signup-password"),
      document.getElementById("signup-password-error"),
      ""
    );
    setFieldError(
      document.getElementById("signup-confirm-password"),
      document.getElementById("signup-confirm-password-error"),
      ""
    );
    setFormMessage(document.getElementById("signup-form-message"), "", "");
  }

  function showLoggedInView(user) {
    const authView = document.getElementById("auth-view");
    const loggedInView = document.getElementById("logged-in-view");
    const loggedInName = document.getElementById("logged-in-name");

    if (loggedInName) {
      loggedInName.textContent = user.name || user.email || "Friend";
    }
    if (authView) {
      authView.classList.add("d-none");
    }
    if (loggedInView) {
      loggedInView.classList.remove("d-none");
    }
  }

  function restoreRememberedEmail() {
    const rememberedEmail = readStorageValue(STORAGE_KEYS.REMEMBER_EMAIL);
    const loginEmailInput = document.getElementById("login-email");
    const rememberCheckbox = document.getElementById("login-remember");

    if (rememberedEmail && loginEmailInput) {
      loginEmailInput.value = rememberedEmail;
      if (rememberCheckbox) {
        rememberCheckbox.checked = true;
      }
    }
  }

  function showAuthView() {
    const authView = document.getElementById("auth-view");
    const loggedInView = document.getElementById("logged-in-view");
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");

    if (loginForm) {
      loginForm.reset();
    }
    if (signupForm) {
      signupForm.reset();
    }

    clearFormFeedback("login");
    clearFormFeedback("signup");
    updateStrengthMeter("");
    restoreRememberedEmail();

    if (loggedInView) {
      loggedInView.classList.add("d-none");
    }
    if (authView) {
      authView.classList.remove("d-none");
    }
  }

  function togglePasswordVisibility(button) {
    const targetId = button.getAttribute("data-target");
    const input = targetId ? document.getElementById(targetId) : null;
    if (!input) {
      return;
    }

    const willShow = input.type === "password";
    input.type = willShow ? "text" : "password";
    button.setAttribute("aria-pressed", String(willShow));
    button.setAttribute("aria-label", willShow ? "Hide password" : "Show password");
    button.innerHTML = willShow ? EYE_CLOSED_SVG : EYE_OPEN_SVG;
  }

  function handleLoginSubmit(event) {
    event.preventDefault();
    clearFormFeedback("login");

    const emailInput = document.getElementById("login-email");
    const emailError = document.getElementById("login-email-error");
    const passwordInput = document.getElementById("login-password");
    const passwordError = document.getElementById("login-password-error");
    const rememberCheckbox = document.getElementById("login-remember");
    const formMessage = document.getElementById("login-form-message");

    const email = normalizeEmail(emailInput ? emailInput.value : "");
    const password = passwordInput ? passwordInput.value : "";

    let hasEmptyField = false;
    if (!email) {
      setFieldError(emailInput, emailError, "Email address is required.");
      hasEmptyField = true;
    }
    if (!password) {
      setFieldError(passwordInput, passwordError, "Password is required.");
      hasEmptyField = true;
    }
    if (hasEmptyField) {
      return;
    }

    const users = getUsers();
    const matchedUser = users.find(function (user) {
      return (
        user &&
        typeof user.email === "string" &&
        typeof user.password === "string" &&
        normalizeEmail(user.email) === email &&
        user.password === password
      );
    });

    if (!matchedUser) {
      setFormMessage(formMessage, LOGIN_FAILURE_MESSAGE, "error");
      return;
    }

    if (rememberCheckbox && rememberCheckbox.checked) {
      writeStorageValue(STORAGE_KEYS.REMEMBER_EMAIL, email);
    } else {
      removeStorageValue(STORAGE_KEYS.REMEMBER_EMAIL);
    }

    const sessionUser = {
      name: typeof matchedUser.name === "string" ? matchedUser.name : "",
      email: normalizeEmail(matchedUser.email)
    };
    setCurrentUser(sessionUser);
    if (passwordInput) {
      passwordInput.value = "";
    }
    showLoggedInView(sessionUser);
  }

  function handleSignupSubmit(event) {
    event.preventDefault();
    clearFormFeedback("signup");

    const nameInput = document.getElementById("signup-name");
    const nameError = document.getElementById("signup-name-error");
    const emailInput = document.getElementById("signup-email");
    const emailError = document.getElementById("signup-email-error");
    const passwordInput = document.getElementById("signup-password");
    const passwordError = document.getElementById("signup-password-error");
    const confirmInput = document.getElementById("signup-confirm-password");
    const confirmError = document.getElementById("signup-confirm-password-error");
    const formMessage = document.getElementById("signup-form-message");

    const name = nameInput ? nameInput.value.trim() : "";
    const email = normalizeEmail(emailInput ? emailInput.value : "");
    const password = passwordInput ? passwordInput.value : "";
    const confirmPassword = confirmInput ? confirmInput.value : "";

    let isValid = true;
    const users = getUsers();

    if (!name) {
      setFieldError(nameInput, nameError, "Full name is required.");
      isValid = false;
    }

    if (!email) {
      setFieldError(emailInput, emailError, "Email address is required.");
      isValid = false;
    } else if (!isValidEmail(email)) {
      setFieldError(emailInput, emailError, "Please enter a valid email address.");
      isValid = false;
    } else {
      const emailExists = users.some(function (user) {
        return user && typeof user.email === "string" && normalizeEmail(user.email) === email;
      });
      if (emailExists) {
        setFieldError(emailInput, emailError, DUPLICATE_EMAIL_MESSAGE);
        isValid = false;
      }
    }

    if (!password) {
      setFieldError(passwordInput, passwordError, "Password is required.");
      isValid = false;
    } else if (getPasswordStrength(password).level === "Weak") {
      setFieldError(passwordInput, passwordError, WEAK_PASSWORD_HINT);
      isValid = false;
    }

    if (!confirmPassword) {
      setFieldError(confirmInput, confirmError, "Please confirm your password.");
      isValid = false;
    } else if (password !== confirmPassword) {
      setFieldError(confirmInput, confirmError, PASSWORD_MISMATCH_MESSAGE);
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    const newUser = {
      name: name,
      email: email,
      password: password
    };

    users.push(newUser);
    saveUsers(users);

    const sessionUser = {
      name: newUser.name,
      email: newUser.email
    };
    setCurrentUser(sessionUser);
    setFormMessage(formMessage, ACCOUNT_CREATED_MESSAGE, "success");
    showLoggedInView(sessionUser);
  }

  function handleLogout() {
    clearCurrentUser();
    showAuthView();
  }

  function initLoginPage() {
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const logoutBtn = document.getElementById("logout-btn");
    const signupPasswordInput = document.getElementById("signup-password");
    const toggleButtons = document.querySelectorAll(".toggle-password-btn");

    toggleButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        togglePasswordVisibility(button);
      });
    });

    if (signupPasswordInput) {
      signupPasswordInput.addEventListener("input", function () {
        updateStrengthMeter(signupPasswordInput.value);
      });
    }

    [
      ["login-email", "login-email-error", "login-form-message"],
      ["login-password", "login-password-error", "login-form-message"],
      ["signup-name", "signup-name-error", "signup-form-message"],
      ["signup-email", "signup-email-error", "signup-form-message"],
      ["signup-confirm-password", "signup-confirm-password-error", "signup-form-message"]
    ].forEach(function (ids) {
      const input = document.getElementById(ids[0]);
      const errorEl = document.getElementById(ids[1]);
      const formMsg = document.getElementById(ids[2]);
      if (input) {
        input.addEventListener("input", function () {
          setFieldError(input, errorEl, "");
          setFormMessage(formMsg, "", "");
        });
      }
    });

    if (loginForm) {
      loginForm.addEventListener("submit", handleLoginSubmit);
    }
    if (signupForm) {
      signupForm.addEventListener("submit", handleSignupSubmit);
    }
    if (logoutBtn) {
      logoutBtn.addEventListener("click", handleLogout);
    }

    const activeUser = getCurrentUser();
    if (activeUser) {
      showLoggedInView(activeUser);
    } else {
      restoreRememberedEmail();
      updateStrengthMeter("");
    }
  }

  document.addEventListener("DOMContentLoaded", initLoginPage);
})();
