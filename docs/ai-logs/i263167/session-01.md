# AI Session Log — Session 01 (Day 1)

- **Project:** SE-D_Group11_PawHome (`Paw Home`)
- **Roll Number / Branch:** `i263167`
- **Date:** 2026-11-27
- **Note:** Unedited export of User prompts and Assistant responses from Session 01 (Day 1).

---

## Turn 1

### User (2026-11-27 19:40:52 +05:00)

```text
/plan PROJECT: 'Paw Home', a pet adoption website for Islamabad. Use only HTML5, CSS3, Bootstrap 5
(CDN) and vanilla JavaScript. No other frameworks or libraries. Relative paths only (files in
pages/ link back with ../).

STRICT RULES:
1. Do NOT run any terminal command (no git, npm, servers, tests, ls, cat). Only create or edit
   files directly. I will run and test everything myself.
2. Only create or edit these files: pages/login.html, css/login.css, js/login.js,
   pages/favourites.html, css/favourites.css, js/favourites.js, pages/donate.html,
   css/donate.css, js/donate.js. Never edit css/style.css, js/layout.js, js/data.js,
   js/storage.js, README.md or any other file.
3. Do NOT write your own header, nav or footer. js/layout.js injects them.
   layout.js needs: <what a page must include, e.g. empty header/footer mount elements>.
4. Keep the code simple, commented, and easy to explain, because I must change it live
   without AI.

SHARED FACTS (do not invent anything else):
- CSS variables in style.css: --orange:#E8743B, --navy:#2B2D42, --cream:#FFF6EC, --teal:#2A9D8F.
- One PETS object looks like: <paste one real object from data.js>.
- storage.js helper functions: <paste the function names and what they do>.
- Load order on each page: Bootstrap CSS (CDN), ../css/style.css, my page css; scripts at the
  end: ../js/data.js, ../js/storage.js, ../js/layout.js, my page js.
- localStorage keys, use exactly: ph_favourites (array of pet ids), ph_users (array of
  accounts), ph_user (current session), ph_donations (donation history).
- Pages: pages/pets.html is Browse Pets, pages/pet-details.html is Pet Details.
- Use semantic tags (header, nav, main, section, footer), one h1 per page, alt text on images.
```

### Assistant (2026-11-27 14:41:15Z)

Before I draft the implementation plan, I inspected the current workspace and found only [README.md](file:///E:/University_i263167_D/Semester%201/Projects/IICT/SE-D_Group11_PawHome/README.md) and [index.html](file:///E:/University_i263167_D/Semester%201/Projects/IICT/SE-D_Group11_PawHome/index.html) (on branch `i263167`). The shared files (`css/style.css`, `js/layout.js`, `js/data.js`, `js/storage.js`, `pages/pets.html`, and `pages/pet-details.html`) are not in the workspace yet, and your prompt still has the three placeholder slots under `SHARED FACTS` / `layout.js`.

From [index.html](file:///E:/University_i263167_D/Semester%201/Projects/IICT/SE-D_Group11_PawHome/index.html), I can already see:
- **Mount elements & accessibility:** `<a href="#main" class="skip-link">`, `<div id="site-header"></div>`, `<main id="main" tabindex="-1">`, and `<div id="site-footer"></div>`.
- **Bootstrap 5 CDN:** `bootstrap@5.3.3` CSS and `bootstrap.bundle.min.js`.
- **Global theme classes:** `.paw-hero`, `.paw-section`, `.paw-card`, `.paw-card-body`, `.paw-card-title`, `.paw-card-meta`, `.paw-badge` (`-orange`, `-teal`, `-navy`), `.btn-paw`, and `.btn-paw-outline`.

Because you asked me **not to invent any shared facts**, please paste (or pull into the repo) the missing details before I generate the plan:

1. **`js/layout.js` requirements:** Beyond `<div id="site-header"></div>` and `<div id="site-footer"></div>`, does `layout.js` expect anything else (for example, a `data-page` attribute on `<body>` for active nav highlighting, or specific element IDs for user/favourite counts)?
2. **`js/data.js` structure:** Please paste one real object from `PETS` (and confirm the exact global variable name, plus any shelter array if `donate.html` should list Islamabad shelters).
3. **`js/storage.js` helpers:** Please paste the helper function names, parameters, and return values so `login.js`, `favourites.js`, and `donate.js` use them directly instead of duplicating `localStorage` logic.
4. **Any page-specific requirements (optional):**
   - `login.html`: Login + Sign Up toggle/tabs, validation rules, and where to redirect after login?
   - `favourites.html`: Card fields to display, link format to `pet-details.html` (e.g., `pet-details.html?id=...`), and remove/clear actions?
   - `donate.html`: Preset PKR amounts + custom amount, optional shelter/purpose dropdown, donor fields, and how `ph_donations` history should be displayed?

Once you share these, I will put together the detailed implementation plan for your review.

---

## Turn 2

### User (2026-11-27 19:45:09 +05:00)

```text
Create pages/login.html and css/login.css, and create js/login.js as an empty file with just a
comment. Do not run any commands.
Layout:
- A centred card with Bootstrap tabs: "Login" | "Sign Up".
- Sign Up tab: Full name, Email, Password with a show/hide eye button, a password strength
  meter (a bar plus a text label, grey and empty by default), Confirm password, and a
  "Create Account" button.
- Login tab: Email, Password with an eye button, a "Remember me" checkbox, a "Login" button.
- A hidden "logged-in" view: heading "Welcome, NAME", a short line of text, a "Logout" button,
  and a "Browse Pets" link to ../pages/pets.html.
- An empty message element under each field for errors (aria-live="polite").
Style: colours from CSS variables only; orange primary buttons, cream background, teal for
success, red for errors. Card full width under 576px and buttons full width on mobile.
Accessibility: a label on every input, visible focus outlines, aria-describedby for errors.
No validation or storage logic yet. At the end, list the element ids you used and explain the
structure briefly. Do not run any commands.
```

### Assistant (2026-11-27 14:48:01Z)

Created [pages/login.html](file:///E:/University_i263167_D/Semester%201/Projects/IICT/SE-D_Group11_PawHome/pages/login.html), [css/login.css](file:///E:/University_i263167_D/Semester%201/Projects/IICT/SE-D_Group11_PawHome/css/login.css), and [js/login.js](file:///E:/University_i263167_D/Semester%201/Projects/IICT/SE-D_Group11_PawHome/js/login.js) (comment-only placeholder, with no validation or storage logic yet and no commands executed).

### Structure Summary
- **[pages/login.html](file:///E:/University_i263167_D/Semester%201/Projects/IICT/SE-D_Group11_PawHome/pages/login.html):**
  - Loads Bootstrap 5 CSS CDN, `../css/style.css`, and `../css/login.css` in order, and ends with Bootstrap 5 JS bundle, `../js/data.js`, `../js/storage.js`, `../js/layout.js`, and `../js/login.js`.
  - Uses `<div id="site-header"></div>`, `<main id="main" tabindex="-1">`, `<section>`, and `<div id="site-footer"></div>` so `layout.js` injects the shared header and footer.
  - Inside the centred Bootstrap card (`#auth-card`), `#auth-view` holds the single `<h1>` (`#auth-heading`), the Bootstrap 5 `"Login"` / `"Sign Up"` tabs, and both forms with `<label for="...">`, inline SVG eye buttons, a grey/empty strength meter, and `aria-describedby` + `aria-live="polite"` error containers.
  - `#logged-in-view` starts hidden (`d-none`) and holds the `"Welcome, NAME"` heading, short status text, `"Browse Pets"` link (`../pages/pets.html`), and `"Logout"` button.
- **[css/login.css](file:///E:/University_i263167_D/Semester%201/Projects/IICT/SE-D_Group11_PawHome/css/login.css):**
  - Uses CSS variables for all colours (`--cream` background, `--orange` primary buttons, `--teal` success, `--navy` text/focus outlines, plus local `:root` variables for error red, neutral grey track, borders, and white card surface).
  - Applies `:focus-visible` outlines for keyboard accessibility and makes the card and primary/logout buttons full-width below `576px` while keeping the eye toggle inline.
- **[js/login.js](file:///E:/University_i263167_D/Semester%201/Projects/IICT/SE-D_Group11_PawHome/js/login.js):**
  - Contains only a single placeholder comment.

### Element IDs Used
- **Layout & Card:** `site-header`, `main`, `site-footer`, `auth-card`, `auth-view`, `auth-heading`, `auth-tabs`, `login-tab`, `signup-tab`, `auth-tab-content`, `login-pane`, `signup-pane`
- **Login Form:** `login-form`, `login-email`, `login-email-error`, `login-password`, `login-toggle-password`, `login-password-error`, `login-remember`, `login-form-message`, `login-submit-btn`
- **Sign Up Form:** `signup-form`, `signup-name`, `signup-name-error`, `signup-email`, `signup-email-error`, `signup-password`, `signup-toggle-password`, `signup-strength-meter`, `signup-strength-track`, `signup-strength-fill`, `signup-strength-text`, `signup-password-error`, `signup-confirm-password`, `signup-confirm-password-error`, `signup-form-message`, `signup-submit-btn`
- **Logged-In View:** `logged-in-view`, `logged-in-heading`, `logged-in-name`, `logged-in-text`, `browse-pets-link`, `logout-btn`

---

## Turn 3

### User (2026-11-27 20:10:30 +05:00)

```text
Write js/login.js for the existing pages/login.html. Edit only js/login.js, plus
pages/login.html if an id is missing. Do not run any commands.
Storage: accounts in ph_users (array of {name, email, password}); current session in ph_user
saved as <shape layout.js expects, e.g. {name, email}>. Use the storage.js helpers.
Sign Up:
- Strength score from 5 rules: length >= 8, lowercase, uppercase, digit, symbol. Map the score
  to Weak / Medium / Strong and update the bar width, colour (red/yellow/green) and text live
  as the user types.
- While the password is Weak, "Create Account" is disabled and the hint says "Use 8+
  characters, a number and a symbol".
- Validate: name required, email format, passwords match ("Passwords do not match"),
  duplicate email ("This email is already registered").
- On success: save the user, show "Account created!", set ph_user, show the logged-in view.
Login:
- For any failure show the generic message "Incorrect email or password". Trim and lowercase
  emails before comparing.
- "Remember me" pre-fills the email next visit, saved under ph_remember_email.
Logged-in view: shown on page load if ph_user exists. Logout removes ph_user and returns to
the login view. The eye buttons toggle the input type.
Edge cases: corrupted or missing ph_users JSON resets to []; empty fields show errors.
Add a short comment at the top that this login is a client-side simulation only and not secure.
At the end, explain each function in plain language. Do not run any commands.
```

### Assistant (2026-11-27 15:11:51Z)

Implemented [js/login.js](file:///E:/University_i263167_D/Semester%201/Projects/IICT/SE-D_Group11_PawHome/js/login.js) for [pages/login.html](file:///E:/University_i263167_D/Semester%201/Projects/IICT/SE-D_Group11_PawHome/pages/login.html) (all required `id` attributes were already present, so `pages/login.html` did not need edits, and no commands were run).

> [!NOTE]
> `js/storage.js` and `js/layout.js` are still not present in the workspace, so `js/login.js` includes self-contained `localStorage` helpers for `ph_users`, `ph_user` (`{ name, email }`), and `ph_remember_email`. Once your team adds `js/storage.js`, you can swap the bodies of `getUsers`, `saveUsers`, `getCurrentUser`, `setCurrentUser`, and `clearCurrentUser` to call its functions directly. Also note that in [css/login.css](file:///E:/University_i263167_D/Semester%201/Projects/IICT/SE-D_Group11_PawHome/css/login.css), `.strength-weak` / `.strength-medium` / `.strength-strong` map to the theme variables (`--login-error-red`, `--orange`, and `--teal`).

### Plain-Language Guide to Each Function in `js/login.js`

- **`getUsers()`** — Reads `ph_users` from `localStorage` and parses the JSON. If the key is missing, invalid JSON, or not an array, it resets `ph_users` to `[]` and returns an empty array.
- **`saveUsers(users)`** — Converts the `users` array to JSON and stores it under `ph_users`.
- **`getCurrentUser()`** — Reads `ph_user` from `localStorage` to check if someone is logged in. If the data is corrupted, it deletes `ph_user` and returns `null`.
- **`setCurrentUser(user)`** — Saves the active session in `ph_user` as `{ name, email }` (without the password).
- **`clearCurrentUser()`** — Deletes `ph_user` from `localStorage` when logging out.
- **`getRememberedEmail()` / `saveRememberedEmail(email, shouldRemember)`** — Reads, saves, or clears `ph_remember_email` depending on whether the "Remember me" checkbox is checked.
- **`setFieldError(inputEl, errorEl, message)`** — Displays or clears the red error message under an input and toggles the red border class (`is-invalid-field`).
- **`setFormMessage(messageEl, message, type)`** — Displays or clears a form-wide status message (styled red for `'error'` or teal for `'success'`).
- **`isValidEmail(email)`** — Uses a simple regular expression to check that an email has text, `@`, a domain, and a dot.
- **`handleTogglePassword(button)`** — Looks up the input matching `data-target` and flips its `type` between `'password'` and `'text'`, updating `aria-pressed` and `aria-label` for screen readers.
- **`evaluatePasswordStrength(password)`** — Scores a password from `0` to `5` (length ≥ 8, lowercase, uppercase, digit, symbol) and maps it to `Empty`, `Weak` (score 1–2), `Medium` (3–4), or `Strong` (5) with bar width, CSS class, and label text.
- **`updateStrengthMeter()`** — Runs on every keystroke in the Sign Up password box to update the strength bar width, colour class, label text, `aria-valuenow`, and disables `"Create Account"` while the level is `Weak`.
- **`showLoggedInView(user, customMessage)`** — Fills in `"Welcome, NAME"`, updates the short message, hides `#auth-view`, and reveals `#logged-in-view`.
- **`showAuthView()`** — Hides `#logged-in-view`, shows `#auth-view`, and calls `prefillRememberedEmail()`.
- **`prefillRememberedEmail()`** — Puts the saved `ph_remember_email` back into the Login email box and checks "Remember me" if present.
- **`handleSignupSubmit(event)`** — Validates name, email format, password strength, matching confirmation password, and duplicate email; on success, adds `{ name, email, password }` to `ph_users`, sets `ph_user`, shows `"Account created!"`, and switches to the logged-in view.
- **`handleLoginSubmit(event)`** — Trims and lowercases the email, checks for empty fields, verifies credentials against `ph_users` (showing `"Incorrect email or password"` on any mismatch), updates `ph_remember_email`, saves `ph_user`, and opens the logged-in view.
- **`handleLogout()`** — Clears `ph_user`, resets both forms and messages, resets the strength meter, and returns to the Login/Sign Up view.
- **`initLoginPage()`** — Runs on `DOMContentLoaded` to attach all button/form event listeners and immediately show `#logged-in-view` if `ph_user` already exists (or pre-fill the remembered email if logged out).
