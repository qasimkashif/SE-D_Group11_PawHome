/*
  js/donate.js
  Core donation page logic for pages/donate.html:
  - IMPACT array driving both the live summary card and the Impact facts section
  - Delegated preset amount and frequency toggle handlers
  - Amount validation (empty, non-numeric, negative, < 100, > 500000)
  - Draft persistence in localStorage under "ph_donate_draft"
  - Matching code (PAWS2026, case-insensitive, non-stacking via matchActive flag)
  - Donor form pre-fill (ph_user), live validation, submission to ph_donations,
    Bootstrap thank-you modal, form reset, and newest-first donation history
*/

const DONATE_DRAFT_KEY = 'ph_donate_draft';
const DONATIONS_STORAGE_KEY = 'ph_donations';
const USER_STORAGE_KEY = 'ph_user';
const MATCH_CODE = 'PAWS2026';
const PAYMENT_METHODS = ['Easypaisa', 'JazzCash', 'Bank transfer'];
const MIN_DONATION = 100;
const MAX_DONATION = 500000;

/*
  Impact tiers ordered from lowest minAmount to highest.
  Adding or editing an item here automatically updates both:
  1. The "Impact facts" cards on the page
  2. The impact message in the live summary card
*/
const IMPACT = [
  {
    minAmount: 100,
    text: 'Provides clean drinking water and healthy treats for a shelter pet for a week.'
  },
  {
    minAmount: 500,
    text: 'Feeds a rescue dog in Islamabad for a week.'
  },
  {
    minAmount: 1000,
    text: 'Feeds a rescue dog for a full month.'
  },
  {
    minAmount: 2500,
    text: 'Covers core vaccinations and a vet check-up for one pet.'
  },
  {
    minAmount: 5000,
    text: 'Sponsors full shelter care, food, and medical support until adoption.'
  }
];

// Current selected frequency ("one-time" or "monthly") and matching code state
let selectedFrequency = 'one-time';
let matchActive = false;

// --- Storage Helpers ---

/**
 * Reads the saved donation draft from localStorage (ph_donate_draft).
 * Falls back safely to an empty one-time draft if missing or corrupted.
 */
function readDonateDraft() {
  const defaultDraft = { amount: '', frequency: 'one-time' };

  try {
    const raw = localStorage.getItem(DONATE_DRAFT_KEY);
    if (!raw) {
      return defaultDraft;
    }

    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return {
        amount: typeof parsed.amount === 'string' ? parsed.amount : String(parsed.amount || ''),
        frequency: parsed.frequency === 'monthly' ? 'monthly' : 'one-time'
      };
    }
  } catch (error) {
    // Corrupted JSON falls through to reset below
  }

  localStorage.setItem(DONATE_DRAFT_KEY, JSON.stringify(defaultDraft));
  return defaultDraft;
}

/**
 * Saves the current amount text and frequency into localStorage (ph_donate_draft).
 */
function saveDonateDraft(amountText, frequency) {
  const draft = {
    amount: amountText,
    frequency: frequency
  };
  localStorage.setItem(DONATE_DRAFT_KEY, JSON.stringify(draft));
}

/**
 * Reads the logged-in user profile from localStorage (ph_user) if available.
 * Returns { name: string, email: string } or null when missing/corrupted.
 */
function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      const name = typeof parsed.name === 'string'
        ? parsed.name.trim()
        : (typeof parsed.fullName === 'string' ? parsed.fullName.trim() : '');
      const email = typeof parsed.email === 'string' ? parsed.email.trim() : '';
      return { name: name, email: email };
    }
  } catch (error) {
    // Ignore corrupted ph_user safely
  }

  return null;
}

/**
 * Reads saved donation history from localStorage (ph_donations).
 * If missing, returns []. If corrupted or non-array, resets ph_donations to [] and returns [].
 */
function readDonations() {
  try {
    const raw = localStorage.getItem(DONATIONS_STORAGE_KEY);
    if (raw === null || raw === '') {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const validEntries = parsed.filter(function (entry) {
        return (
          entry &&
          typeof entry === 'object' &&
          typeof entry.amount === 'number' &&
          Number.isFinite(entry.amount) &&
          entry.amount > 0
        );
      });

      if (validEntries.length !== parsed.length) {
        localStorage.setItem(DONATIONS_STORAGE_KEY, JSON.stringify(validEntries));
      }

      return validEntries;
    }
  } catch (error) {
    // Corrupted JSON falls through to reset below
  }

  localStorage.setItem(DONATIONS_STORAGE_KEY, JSON.stringify([]));
  return [];
}

/**
 * Appends a valid donation entry to localStorage (ph_donations).
 */
function saveDonation(entry) {
  const donations = readDonations();
  donations.push(entry);
  localStorage.setItem(DONATIONS_STORAGE_KEY, JSON.stringify(donations));
}

// --- Formatting & Validation Helpers ---

/**
 * Formats a numeric PKR amount like "Rs. 1,000".
 */
function formatRupees(amount) {
  return 'Rs. ' + Number(amount).toLocaleString('en-US');
}

/**
 * Validates the raw text from the custom amount input.
 * Returns { valid: boolean, amount: number|null, error: string }.
 */
function validateDonationAmount(rawValue) {
  const trimmed = String(rawValue || '').trim();

  if (trimmed === '') {
    return { valid: false, amount: null, error: 'Please enter a donation amount.' };
  }

  // Allow optional leading minus and digits/decimal so negative and non-numeric are caught clearly
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return { valid: false, amount: null, error: 'Please enter a valid numeric amount.' };
  }

  const numericValue = Number(trimmed);
  if (!Number.isFinite(numericValue)) {
    return { valid: false, amount: null, error: 'Please enter a valid numeric amount.' };
  }

  if (numericValue < 0) {
    return { valid: false, amount: null, error: 'Donation amount cannot be negative.' };
  }

  if (numericValue < MIN_DONATION) {
    return {
      valid: false,
      amount: null,
      error: 'Minimum donation amount is ' + formatRupees(MIN_DONATION) + '.'
    };
  }

  if (numericValue > MAX_DONATION) {
    return {
      valid: false,
      amount: null,
      error: 'Maximum donation amount is ' + formatRupees(MAX_DONATION) + '.'
    };
  }

  return { valid: true, amount: numericValue, error: '' };
}

/**
 * Finds the best matching IMPACT entry for a given valid donation amount.
 */
function getImpactForAmount(amount) {
  let matchedTier = null;

  IMPACT.forEach(function (item) {
    if (amount >= item.minAmount) {
      if (!matchedTier || item.minAmount > matchedTier.minAmount) {
        matchedTier = item;
      }
    }
  });

  return matchedTier;
}

/**
 * Computes the effective impact amount (doubled when matchActive is true),
 * matching tier, and display text without altering the charged amount.
 */
function getImpactDetails(amount, isMatchActive) {
  const impactAmount = isMatchActive ? amount * 2 : amount;
  const matchedTier = getImpactForAmount(impactAmount);
  const impactText = matchedTier
    ? matchedTier.text
    : 'Supports shelter care for pets in Islamabad.';

  return {
    impactAmount: impactAmount,
    matchedTier: matchedTier,
    impactText: impactText
  };
}

/**
 * Validates the donor's full name.
 */
function validateDonorName(rawValue) {
  const trimmed = String(rawValue || '').trim();
  if (trimmed === '') {
    return { valid: false, value: '', error: 'Please enter your full name.' };
  }
  if (trimmed.length < 2) {
    return { valid: false, value: trimmed, error: 'Name must be at least 2 characters.' };
  }
  return { valid: true, value: trimmed, error: '' };
}

/**
 * Validates the donor's email address.
 */
function validateDonorEmail(rawValue) {
  const trimmed = String(rawValue || '').trim();
  if (trimmed === '') {
    return { valid: false, value: '', error: 'Please enter your email address.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { valid: false, value: trimmed, error: 'Please enter a valid email address.' };
  }
  return { valid: true, value: trimmed, error: '' };
}

/**
 * Validates the selected payment method against allowed options.
 */
function validatePaymentMethod(rawValue) {
  const value = String(rawValue || '').trim();
  if (PAYMENT_METHODS.indexOf(value) === -1) {
    return { valid: false, value: '', error: 'Please select a payment method.' };
  }
  return { valid: true, value: value, error: '' };
}

/**
 * Formats an ISO date string into a readable date/time label.
 */
function formatDonationDate(isoDate) {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown date';
  }
  return parsed.toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// --- Rendering & UI Updates ---

/**
 * Renders the "Impact facts" cards from the IMPACT array.
 */
function renderImpactFacts(activeMinAmount) {
  const gridEl = document.getElementById('impact-facts-grid');
  if (!gridEl) return;

  const sortedImpact = IMPACT.slice().sort(function (a, b) {
    return a.minAmount - b.minAmount;
  });

  const fragment = document.createDocumentFragment();

  sortedImpact.forEach(function (item) {
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-lg-4';

    const card = document.createElement('article');
    card.className = 'donate-impact-card';
    if (activeMinAmount !== null && item.minAmount === activeMinAmount) {
      card.classList.add('is-matched');
    }

    const badge = document.createElement('span');
    badge.className = 'donate-impact-badge';
    badge.textContent = formatRupees(item.minAmount) + '+';

    const text = document.createElement('p');
    text.className = 'donate-impact-text';
    text.textContent = item.text;

    card.appendChild(badge);
    card.appendChild(text);
    col.appendChild(card);
    fragment.appendChild(col);
  });

  gridEl.innerHTML = '';
  gridEl.appendChild(fragment);
}

/**
 * Updates the active visual state and aria-pressed on the One-time / Monthly buttons.
 */
function updateFrequencyButtons(frequency) {
  const buttons = document.querySelectorAll('#frequency-toggle [data-frequency]');
  buttons.forEach(function (btn) {
    const isActive = btn.getAttribute('data-frequency') === frequency;
    btn.classList.toggle('is-active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });
}

/**
 * Removes the highlight from all preset amount buttons.
 */
function clearPresetHighlights() {
  const buttons = document.querySelectorAll('#preset-buttons [data-amount]');
  buttons.forEach(function (btn) {
    btn.classList.remove('is-active');
    btn.setAttribute('aria-pressed', 'false');
  });
}

/**
 * Highlights the preset button matching the given amount string (if one exists).
 */
function highlightMatchingPreset(amountStr) {
  const buttons = document.querySelectorAll('#preset-buttons [data-amount]');
  buttons.forEach(function (btn) {
    const isMatch = btn.getAttribute('data-amount') === String(amountStr).trim();
    btn.classList.toggle('is-active', isMatch);
    btn.setAttribute('aria-pressed', String(isMatch));
  });
}

/**
 * Clears the live summary card so it shows nothing when the amount is invalid or empty.
 */
function clearSummaryCard() {
  const contentEl = document.getElementById('summary-content');
  const amountEl = document.getElementById('summary-amount');
  const freqEl = document.getElementById('summary-frequency');
  const impactEl = document.getElementById('summary-impact');
  const matchRowEl = document.getElementById('summary-match-row');
  const impactValueEl = document.getElementById('summary-impact-value');
  const matchBadgeEl = document.getElementById('summary-match-badge');

  amountEl.textContent = '';
  freqEl.textContent = '';
  impactEl.textContent = '';
  impactValueEl.textContent = '';
  matchRowEl.classList.add('d-none');
  matchBadgeEl.classList.toggle('d-none', !matchActive);
  contentEl.classList.add('d-none');
}

/**
 * Shows or clears an inline error message and invalid state on a form field.
 */
function setFieldError(inputEl, errorEl, message) {
  if (!inputEl || !errorEl) return;

  errorEl.textContent = message;
  inputEl.classList.toggle('is-invalid-field', Boolean(message));
  inputEl.setAttribute('aria-invalid', message ? 'true' : 'false');
}

/**
 * Shows an inline error message and marks the custom input invalid.
 */
function setAmountError(message) {
  setFieldError(
    document.getElementById('custom-amount'),
    document.getElementById('amount-error'),
    message
  );
}

/**
 * Validates the current amount, updates error/summary UI, and refreshes Impact facts highlight.
 * Set showEmptyError to false on initial page load when no draft amount exists yet.
 */
function updateDonationUI(showEmptyError) {
  const inputEl = document.getElementById('custom-amount');
  const rawValue = inputEl.value;
  const result = validateDonationAmount(rawValue);

  if (!result.valid) {
    const isEmpty = String(rawValue || '').trim() === '';
    if (isEmpty && !showEmptyError) {
      setAmountError('');
    } else {
      setAmountError(result.error);
    }
    clearSummaryCard();
    renderImpactFacts(null);
    return;
  }

  setAmountError('');

  const contentEl = document.getElementById('summary-content');
  const amountEl = document.getElementById('summary-amount');
  const freqEl = document.getElementById('summary-frequency');
  const impactEl = document.getElementById('summary-impact');
  const matchRowEl = document.getElementById('summary-match-row');
  const impactValueEl = document.getElementById('summary-impact-value');
  const matchBadgeEl = document.getElementById('summary-match-badge');

  const impactDetails = getImpactDetails(result.amount, matchActive);

  // Charged amount stays unchanged; matching code only doubles the impact value shown.
  amountEl.textContent = formatRupees(result.amount);
  freqEl.textContent = selectedFrequency === 'monthly' ? 'Monthly' : 'One-time';
  impactEl.textContent = impactDetails.impactText;

  if (matchActive) {
    impactValueEl.textContent = formatRupees(impactDetails.impactAmount);
    matchRowEl.classList.remove('d-none');
    matchBadgeEl.classList.remove('d-none');
  } else {
    impactValueEl.textContent = '';
    matchRowEl.classList.add('d-none');
    matchBadgeEl.classList.add('d-none');
  }

  contentEl.classList.remove('d-none');
  renderImpactFacts(impactDetails.matchedTier ? impactDetails.matchedTier.minAmount : null);
}

/**
 * Renders the donation history list (newest first) and total donated from ph_donations.
 */
function renderDonationHistory() {
  const listEl = document.getElementById('donation-history-list');
  const emptyEl = document.getElementById('history-empty-state');
  const totalEl = document.getElementById('history-total-donated');
  if (!listEl || !emptyEl || !totalEl) return;

  const donations = readDonations();
  const totalDonated = donations.reduce(function (sum, entry) {
    return sum + entry.amount;
  }, 0);

  totalEl.textContent = formatRupees(totalDonated);

  if (donations.length === 0) {
    emptyEl.classList.remove('d-none');
    listEl.classList.add('d-none');
    listEl.innerHTML = '';
    return;
  }

  const newestFirst = donations
    .map(function (entry, index) {
      return { entry: entry, index: index };
    })
    .sort(function (a, b) {
      const timeA = Date.parse(a.entry.date);
      const timeB = Date.parse(b.entry.date);
      if (Number.isFinite(timeA) && Number.isFinite(timeB) && timeA !== timeB) {
        return timeB - timeA;
      }
      return b.index - a.index;
    });

  const fragment = document.createDocumentFragment();

  newestFirst.forEach(function (wrapped) {
    const entry = wrapped.entry;
    const item = document.createElement('li');
    item.className = 'list-group-item px-0 py-3';

    const topRow = document.createElement('div');
    topRow.className = 'd-flex flex-wrap align-items-center justify-content-between gap-2 mb-1';

    const leftGroup = document.createElement('div');
    leftGroup.className = 'd-flex flex-wrap align-items-center gap-2';

    const amountSpan = document.createElement('span');
    amountSpan.className = 'fw-bold';
    amountSpan.textContent = formatRupees(entry.amount);

    const freqBadge = document.createElement('span');
    freqBadge.className = 'donate-summary-frequency';
    freqBadge.textContent = entry.frequency === 'monthly' ? 'Monthly' : 'One-time';

    leftGroup.appendChild(amountSpan);
    leftGroup.appendChild(freqBadge);

    if (entry.matchApplied) {
      const matchBadge = document.createElement('span');
      matchBadge.className = 'badge rounded-pill text-bg-success';
      matchBadge.textContent = '2x Matched (' + formatRupees(entry.amount * 2) + ' impact)';
      leftGroup.appendChild(matchBadge);
    }

    const dateSpan = document.createElement('span');
    dateSpan.className = 'donate-hint mt-0';
    dateSpan.textContent = formatDonationDate(entry.date);

    topRow.appendChild(leftGroup);
    topRow.appendChild(dateSpan);

    const impactParagraph = document.createElement('p');
    impactParagraph.className = 'mb-0 text-muted small';
    impactParagraph.textContent = entry.impactText || '';

    item.appendChild(topRow);
    item.appendChild(impactParagraph);
    fragment.appendChild(item);
  });

  emptyEl.classList.add('d-none');
  listEl.innerHTML = '';
  listEl.appendChild(fragment);
  listEl.classList.remove('d-none');
}

/**
 * Pre-fills donor name and email when ph_user exists in localStorage.
 */
function prefillDonorFromUser() {
  const user = readStoredUser();
  if (!user) return;

  const nameInput = document.getElementById('donor-name');
  const emailInput = document.getElementById('donor-email');

  if (nameInput && user.name) {
    nameInput.value = user.name;
  }
  if (emailInput && user.email) {
    emailInput.value = user.email;
  }
}

/**
 * Validates one donor form field and updates its live inline error message.
 */
function validateDonorField(inputEl, errorEl, validator) {
  const result = validator(inputEl.value);
  setFieldError(inputEl, errorEl, result.error);
  return result;
}

/**
 * Opens the Bootstrap thank-you modal with details of the completed donation.
 */
function openThankYouModal(donorName, paymentMethod, record) {
  const modalEl = document.getElementById('thank-you-modal');
  const messageEl = document.getElementById('thank-you-message');
  const impactEl = document.getElementById('thank-you-impact');
  if (!modalEl || !messageEl || !impactEl) return;

  const freqLabel = record.frequency === 'monthly' ? 'monthly' : 'one-time';
  let message =
    'Thank you, ' +
    donorName +
    '! Your ' +
    freqLabel +
    ' donation of ' +
    formatRupees(record.amount) +
    ' via ' +
    paymentMethod +
    ' has been recorded.';

  if (record.matchApplied) {
    message +=
      ' Matching code ' +
      MATCH_CODE +
      ' doubled your impact value to ' +
      formatRupees(record.amount * 2) +
      '.';
  }

  messageEl.textContent = message;
  impactEl.textContent = record.impactText;

  if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
  }
}

/**
 * Resets amount, matching code, donor inputs, and error states after a valid donation.
 */
function resetDonationFormState() {
  const donorForm = document.getElementById('donor-form');
  const customInput = document.getElementById('custom-amount');
  const codeInput = document.getElementById('discount-code-input');
  const codeErrorEl = document.getElementById('discount-code-error');
  const codeBadgeEl = document.getElementById('code-applied-badge');
  const nameInput = document.getElementById('donor-name');
  const nameErrorEl = document.getElementById('donor-name-error');
  const emailInput = document.getElementById('donor-email');
  const emailErrorEl = document.getElementById('donor-email-error');
  const paymentSelect = document.getElementById('payment-method');
  const paymentErrorEl = document.getElementById('payment-method-error');

  if (donorForm) {
    donorForm.reset();
  }

  selectedFrequency = 'one-time';
  matchActive = false;

  if (customInput) {
    customInput.value = '';
  }
  if (codeInput) {
    codeInput.value = '';
  }
  if (codeBadgeEl) {
    codeBadgeEl.classList.add('d-none');
  }

  setFieldError(codeInput, codeErrorEl, '');
  setFieldError(nameInput, nameErrorEl, '');
  setFieldError(emailInput, emailErrorEl, '');
  setFieldError(paymentSelect, paymentErrorEl, '');

  updateFrequencyButtons(selectedFrequency);
  clearPresetHighlights();
  saveDonateDraft('', selectedFrequency);
  updateDonationUI(false);
}

// --- Event Handlers ---

/**
 * Delegated click handler for all preset amount buttons.
 */
function handlePresetClick(event) {
  const button = event.target.closest('[data-amount]');
  if (!button) return;

  const presetAmount = button.getAttribute('data-amount');
  const inputEl = document.getElementById('custom-amount');

  inputEl.value = presetAmount;
  highlightMatchingPreset(presetAmount);
  saveDonateDraft(presetAmount, selectedFrequency);
  updateDonationUI(true);
}

/**
 * Handles manual typing in the custom amount input and clears preset highlights.
 */
function handleCustomAmountInput(event) {
  clearPresetHighlights();
  saveDonateDraft(event.target.value.trim(), selectedFrequency);
  updateDonationUI(true);
}

/**
 * Delegated click handler for the One-time / Monthly toggle.
 */
function handleFrequencyClick(event) {
  const button = event.target.closest('[data-frequency]');
  if (!button) return;

  selectedFrequency = button.getAttribute('data-frequency') === 'monthly' ? 'monthly' : 'one-time';
  updateFrequencyButtons(selectedFrequency);

  const inputEl = document.getElementById('custom-amount');
  const trimmedAmount = inputEl.value.trim();
  saveDonateDraft(trimmedAmount, selectedFrequency);
  updateDonationUI(trimmedAmount !== '');
}

/**
 * Applies the matching code (PAWS2026, case-insensitive) without stacking.
 */
function handleApplyCodeClick() {
  const codeInput = document.getElementById('discount-code-input');
  const errorEl = document.getElementById('discount-code-error');
  const badgeEl = document.getElementById('code-applied-badge');
  const customInput = document.getElementById('custom-amount');
  if (!codeInput || !errorEl || !badgeEl) return;

  const enteredCode = codeInput.value.trim().toUpperCase();

  if (enteredCode === MATCH_CODE) {
    setFieldError(codeInput, errorEl, '');
    badgeEl.classList.remove('d-none');

    // Guard with matchActive so applying the same code twice never stacks
    if (matchActive) {
      return;
    }

    matchActive = true;
    updateDonationUI(customInput.value.trim() !== '');
    return;
  }

  const errorMessage = enteredCode === ''
    ? 'Please enter a matching code.'
    : 'Invalid matching code. Please check your code and try again.';
  setFieldError(codeInput, errorEl, errorMessage);
}

/**
 * Clears any stale discount-code error while the user edits the input.
 */
function handleDiscountCodeInput() {
  const codeInput = document.getElementById('discount-code-input');
  const errorEl = document.getElementById('discount-code-error');
  setFieldError(codeInput, errorEl, '');
}

/**
 * Validates amount + donor details, saves the donation to ph_donations,
 * opens the thank-you modal, resets the form, and re-renders history.
 */
function handleDonorFormSubmit(event) {
  event.preventDefault();

  const customInput = document.getElementById('custom-amount');
  const nameInput = document.getElementById('donor-name');
  const nameErrorEl = document.getElementById('donor-name-error');
  const emailInput = document.getElementById('donor-email');
  const emailErrorEl = document.getElementById('donor-email-error');
  const paymentSelect = document.getElementById('payment-method');
  const paymentErrorEl = document.getElementById('payment-method-error');

  const amountResult = validateDonationAmount(customInput.value);
  if (!amountResult.valid) {
    updateDonationUI(true);
  }

  const nameResult = validateDonorField(nameInput, nameErrorEl, validateDonorName);
  const emailResult = validateDonorField(emailInput, emailErrorEl, validateDonorEmail);
  const paymentResult = validateDonorField(paymentSelect, paymentErrorEl, validatePaymentMethod);

  if (!amountResult.valid) {
    customInput.focus();
    return;
  }
  if (!nameResult.valid) {
    nameInput.focus();
    return;
  }
  if (!emailResult.valid) {
    emailInput.focus();
    return;
  }
  if (!paymentResult.valid) {
    paymentSelect.focus();
    return;
  }

  const impactDetails = getImpactDetails(amountResult.amount, matchActive);
  const donationRecord = {
    date: new Date().toISOString(),
    amount: amountResult.amount,
    frequency: selectedFrequency,
    matchApplied: matchActive,
    impactText: impactDetails.impactText
  };

  saveDonation(donationRecord);
  openThankYouModal(nameResult.value, paymentResult.value, donationRecord);
  resetDonationFormState();
  renderDonationHistory();
}

// --- Page Initialization ---

/**
 * Restores any saved ph_donate_draft, pre-fills ph_user, attaches listeners,
 * and renders initial summary and donation history.
 */
function initDonatePage() {
  const presetContainer = document.getElementById('preset-buttons');
  const frequencyContainer = document.getElementById('frequency-toggle');
  const customInput = document.getElementById('custom-amount');
  const codeInput = document.getElementById('discount-code-input');
  const applyCodeBtn = document.getElementById('apply-code-btn');
  const donorForm = document.getElementById('donor-form');
  const nameInput = document.getElementById('donor-name');
  const nameErrorEl = document.getElementById('donor-name-error');
  const emailInput = document.getElementById('donor-email');
  const emailErrorEl = document.getElementById('donor-email-error');
  const paymentSelect = document.getElementById('payment-method');
  const paymentErrorEl = document.getElementById('payment-method-error');

  // Restore saved draft from localStorage (ph_donate_draft)
  const draft = readDonateDraft();
  selectedFrequency = draft.frequency;
  customInput.value = draft.amount;

  updateFrequencyButtons(selectedFrequency);

  if (draft.amount.trim() !== '') {
    highlightMatchingPreset(draft.amount);
    updateDonationUI(true);
  } else {
    updateDonationUI(false);
  }

  // Pre-fill donor name and email from ph_user if available, and render history
  prefillDonorFromUser();
  renderDonationHistory();

  // Attach delegated and input listeners
  presetContainer.addEventListener('click', handlePresetClick);
  frequencyContainer.addEventListener('click', handleFrequencyClick);
  customInput.addEventListener('input', handleCustomAmountInput);

  if (applyCodeBtn) {
    applyCodeBtn.addEventListener('click', handleApplyCodeClick);
  }
  if (codeInput) {
    codeInput.addEventListener('input', handleDiscountCodeInput);
  }

  if (nameInput) {
    nameInput.addEventListener('input', function () {
      validateDonorField(nameInput, nameErrorEl, validateDonorName);
    });
    nameInput.addEventListener('blur', function () {
      validateDonorField(nameInput, nameErrorEl, validateDonorName);
    });
  }

  if (emailInput) {
    emailInput.addEventListener('input', function () {
      validateDonorField(emailInput, emailErrorEl, validateDonorEmail);
    });
    emailInput.addEventListener('blur', function () {
      validateDonorField(emailInput, emailErrorEl, validateDonorEmail);
    });
  }

  if (paymentSelect) {
    paymentSelect.addEventListener('change', function () {
      validateDonorField(paymentSelect, paymentErrorEl, validatePaymentMethod);
    });
    paymentSelect.addEventListener('blur', function () {
      validateDonorField(paymentSelect, paymentErrorEl, validatePaymentMethod);
    });
  }

  if (donorForm) {
    donorForm.addEventListener('submit', handleDonorFormSubmit);
  }
}

document.addEventListener('DOMContentLoaded', initDonatePage);
