# AI Session Log — Session 02 (Day 2)

- **Project:** SE-D_Group11_PawHome (`Paw Home`)
- **Roll Number / Branch:** `i263167`
- **Date:** 2026-11-28
- **Note:** Unedited export of User prompts and Assistant responses from Session 02 (Day 2).

---

## Turn 1

### User (2026-11-28 14:57:36 +05:00)

```text
Extend pages/donate.html and js/donate.js. Keep all existing working code. Edit only these two
files. Do not run any commands.
Add:
- A discount/matching code input and Apply button. The code PAWS2026 (case-insensitive)
  doubles the impact value shown in the summary, not the amount charged. An invalid code shows
  an error. Applying it twice must not stack (use a matchActive flag). Show a "Code applied"
  badge.
- A donor form: name, email, payment method select (Easypaisa / JazzCash / Bank transfer). No
  card numbers or real payment data. Validate every field with live error messages. If
  ph_user exists, pre-fill name and email from it.
- On a valid Donate click: save {date, amount, frequency, matchApplied, impactText} to
  ph_donations, open a Bootstrap thank-you modal, reset the form and re-render the history.
- A donation history list rendered from ph_donations, newest first, with a total donated.
  Empty state text: "Your first donation will appear here".
Edge cases: corrupted ph_donations resets to []; donating without a valid amount is blocked;
history survives a reload.
At the end, explain how each part of the logic works. Do not run any commands.
```

### Assistant (2026-11-28 10:00:31Z)

Extended [pages/donate.html](file:///E:/University_i263167_D/Semester%201/Projects/IICT/SE-D_Group11_PawHome/pages/donate.html) and [js/donate.js](file:///E:/University_i263167_D/Semester%201/Projects/IICT/SE-D_Group11_PawHome/js/donate.js) while keeping all existing frequency, preset, custom-amount, `ph_donate_draft`, and Impact Facts logic intact. No other files were modified and no commands were run.

### How Each Part Works

1. **Matching / Discount Code (`PAWS2026`)**
   - **Markup**: Populated `#discount-code-section` in [pages/donate.html](file:///E:/University_i263167_D/Semester%201/Projects/IICT/SE-D_Group11_PawHome/pages/donate.html#L151-L195) with `#discount-code-input`, `#apply-code-btn` (`Apply`), `#code-applied-badge` (`Code applied`), and `#discount-code-error`. Added `#summary-match-badge` and `#summary-match-row` (`#summary-impact-value`) inside `#donation-summary-card` ([pages/donate.html](file:///E:/University_i263167_D/Semester%201/Projects/IICT/SE-D_Group11_PawHome/pages/donate.html#L298-L321)).
   - **Logic**: `handleApplyCodeClick` ([js/donate.js](file:///E:/University_i263167_D/Semester%201/Projects/IICT/SE-D_Group11_PawHome/js/donate.js#L726-L753)) trims and uppercases the input and compares it against `MATCH_CODE` (`'PAWS2026'`).
   - **Non-stacking & Summary Impact**: A boolean `matchActive` flag ([js/donate.js](file:///E:/University_i263167_D/Semester%201/Projects/IICT/SE-D_Group11_PawHome/js/donate.js#L52)) ensures applying `PAWS2026` twice returns early without stacking. `getImpactDetails` ([js/donate.js](file:///E:/University_i263167_D/Semester%201/Projects/IICT/SE-D_Group11_PawHome/js/donate.js#L241-L253)) doubles `impactAmount` (`amount * 2`) when `matchActive` is `true` to compute the matched impact tier and `Rs.` impact value, while `updateDonationUI` ([js/donate.js](file:///E:/University_i263167_D/Semester%201/Projects/IICT/SE-D_Group11_PawHome/js/donate.js#L434-L480)) keeps `#summary-amount` as the original charged amount. Invalid or empty codes show an error via `setFieldError` ([js/donate.js](file:///E:/University_i263167_D/Semester%201/Projects/IICT/SE-D_Group11_PawHome/js/donate.js#L411-L417)), cleared on typing by `handleDiscountCodeInput`.

2. **Donor Form, `ph_user` Pre-fill & Live Validation**
   - **Markup**: Populated `#donor-form-section` in [pages/donate.html](file:///E:/University_i263167_D/Semester%201/Projects/IICT/SE-D_Group11_PawHome/pages/donate.html#L197-L287) with `#donor-form` containing `#donor-name`, `#donor-email`, `#payment-method` (`Easypaisa`, `JazzCash`, `Bank transfer` — no card numbers or real payment fields), per-field error paragraphs, and `#donate-submit-btn`.
   - **Pre-fill**: `readStoredUser` ([js/donate.js](file:///E:/University_i263167_D/Semester%201/Projects/IICT/SE-D_Group11_PawHome/js/donate.js#L99-L119)) safely parses `localStorage.getItem('ph_user')` and `prefillDonorFromUser` ([js/donate.js](file:///E:/University_i263167_D/Semester%201/Projects/IICT/SE-D_Group11_PawHome/js/donate.js#L574-L587)) populates `#donor-name` and `#donor-email` on initialization.
   - **Live Validation**: `validateDonorName`, `validateDonorEmail`, and `validatePaymentMethod` ([js/donate.js](file:///E:/University_i263167_D/Semester%201/Projects/IICT/SE-D_Group11_PawHome/js/donate.js#L258-L292)) run through `validateDonorField` on `input`/`change` and `blur` events wired in `initDonatePage` ([js/donate.js](file:///E:/University_i263167_D/Semester%201/Projects/IICT/SE-D_Group11_PawHome/js/donate.js#L870-L895)), updating inline messages and `aria-invalid` / `.is-invalid-field`.

3. **Donation Submission, Thank-You Modal & Reset**
   - **Validation Gate**: `handleDonorFormSubmit` ([js/donate.js](file:///E:/University_i263167_D/Semester%201/Projects/IICT/SE-D_Group11_PawHome/js/donate.js#L768-L818)) prevents default submit and validates the donation amount plus all three donor fields. If the amount is invalid/missing (or any donor field is invalid), it renders the errors, focuses the first invalid field, and exits without saving or opening the modal.
   - **Persistence & Modal**: On valid submission, `saveDonation` ([js/donate.js](file:///E:/University_i263167_D/Semester%201/Projects/IICT/SE-D_Group11_PawHome/js/donate.js#L161-L165)) appends `{ date, amount, frequency, matchApplied, impactText }` to `ph_donations` in `localStorage`. `openThankYouModal` ([js/donate.js](file:///E:/University_i263167_D/Semester%201/Projects/IICT/SE-D_Group11_PawHome/js/donate.js#L601-L634)) populates `#thank-you-message` and `#thank-you-impact` and opens `#thank-you-modal` ([pages/donate.html](file:///E:/University_i263167_D/Semester%201/Projects/IICT/SE-D_Group11_PawHome/pages/donate.html#L380-L415)) via `bootstrap.Modal.getOrCreateInstance(modalEl).show()`.
   - **Reset**: `resetDonationFormState` ([js/donate.js](file:///E:/University_i263167_D/Semester%201/Projects/IICT/SE-D_Group11_PawHome/js/donate.js#L639-L678)) resets the form, clears the amount/draft and matching code state (`matchActive = false`, hides `#code-applied-badge`), clears all errors, resets frequency to `one-time`, and calls `updateDonationUI(false)`, followed by `renderDonationHistory()`.

4. **Donation History & Corrupted Storage Edge Cases**
   - **Markup**: `#donation-history-section` ([pages/donate.html](file:///E:/University_i263167_D/Semester%201/Projects/IICT/SE-D_Group11_PawHome/pages/donate.html#L349-L377)) includes `#history-total-donated`, `#history-empty-state` (`"Your first donation will appear here"`), and `#donation-history-list`.
   - **Safe Reading & Recovery**: `readDonations` ([js/donate.js](file:///E:/University_i263167_D/Semester%201/Projects/IICT/SE-D_Group11_PawHome/js/donate.js#L125-L156)) wraps `JSON.parse` in `try/catch`; if `ph_donations` is invalid JSON or not an array, it resets `localStorage` `ph_donations` to `[]` and returns `[]` (and filters out malformed entries if an array contains invalid items).
   - **Rendering**: `renderDonationHistory` ([js/donate.js](file:///E:/University_i263167_D/Semester%201/Projects/IICT/SE-D_Group11_PawHome/js/donate.js#L485-L569)) runs on initial page load (`initDonatePage`) and after each donation so history survives reloads. It calculates the total donated from `ph_donations`, shows the empty state when empty, or sorts entries newest-first (by parsed date descending, falling back to reverse index order) and renders each entry's amount, frequency, optional `2x Matched` badge, date, and `impactText`.

*Note: Per your instruction not to run any commands, these changes were verified by code inspection only and were not executed in a browser or test runner.*
