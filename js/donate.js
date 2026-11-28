/*
  js/donate.js
  Core donation page logic for pages/donate.html:
  - IMPACT array driving both the live summary card and the Impact facts section
  - Delegated preset amount and frequency toggle handlers
  - Amount validation (empty, non-numeric, negative, < 100, > 500000)
  - Draft persistence in localStorage under "ph_donate_draft"
*/

const DONATE_DRAFT_KEY = 'ph_donate_draft';
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

// Current selected frequency ("one-time" or "monthly")
let selectedFrequency = 'one-time';

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

  amountEl.textContent = '';
  freqEl.textContent = '';
  impactEl.textContent = '';
  contentEl.classList.add('d-none');
}

/**
 * Shows an inline error message and marks the custom input invalid.
 */
function setAmountError(message) {
  const inputEl = document.getElementById('custom-amount');
  const errorEl = document.getElementById('amount-error');

  errorEl.textContent = message;
  inputEl.classList.toggle('is-invalid-field', Boolean(message));
  inputEl.setAttribute('aria-invalid', message ? 'true' : 'false');
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

  const matchedTier = getImpactForAmount(result.amount);

  amountEl.textContent = formatRupees(result.amount);
  freqEl.textContent = selectedFrequency === 'monthly' ? 'Monthly' : 'One-time';
  impactEl.textContent = matchedTier
    ? matchedTier.text
    : 'Supports shelter care for pets in Islamabad.';

  contentEl.classList.remove('d-none');
  renderImpactFacts(matchedTier ? matchedTier.minAmount : null);
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

// --- Page Initialization ---

/**
 * Restores any saved ph_donate_draft, attaches listeners, and renders initial state.
 */
function initDonatePage() {
  const presetContainer = document.getElementById('preset-buttons');
  const frequencyContainer = document.getElementById('frequency-toggle');
  const customInput = document.getElementById('custom-amount');

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

  // Attach delegated and input listeners
  presetContainer.addEventListener('click', handlePresetClick);
  frequencyContainer.addEventListener('click', handleFrequencyClick);
  customInput.addEventListener('input', handleCustomAmountInput);
}

document.addEventListener('DOMContentLoaded', initDonatePage);
