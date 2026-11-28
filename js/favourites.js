/*
  js/favourites.js
  Manages saved favourite pets on pages/favourites.html using localStorage key "ph_favourites"
  and the global PETS array from js/data.js.
*/

const FAVOURITES_KEY = 'ph_favourites';
const MAX_COMPARE = 3;

// Tracks pet IDs (stored as strings) currently ticked for side-by-side comparison
const selectedCompareIds = new Set();

// --- Storage Helpers (checking global storage.js helpers first, with safe fallbacks) ---

/**
 * Reads the ph_favourites array safely from storage.js or localStorage.
 * If missing, corrupted JSON, or not an array, resets ph_favourites to [] and returns [].
 */
function readFavouritesFromStorage() {
  try {
    // Use global storage.js helper if available
    if (typeof getFavourites === 'function') {
      const fromHelper = getFavourites();
      if (Array.isArray(fromHelper)) {
        return fromHelper;
      }
    } else {
      const raw = localStorage.getItem(FAVOURITES_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    // Corrupted JSON or storage error falls through to reset below
  }

  saveFavouritesToStorage([]);
  return [];
}

/**
 * Writes the ph_favourites array back to storage.js or localStorage.
 */
function saveFavouritesToStorage(ids) {
  if (typeof saveFavourites === 'function') {
    saveFavourites(ids);
    return;
  }
  localStorage.setItem(FAVOURITES_KEY, JSON.stringify(ids));
}

// --- Data & Formatting Helpers ---

/**
 * Returns the global PETS array if loaded, or an empty array otherwise.
 */
function getPetsCatalog() {
  if (typeof PETS !== 'undefined' && Array.isArray(PETS)) {
    return PETS;
  }
  return [];
}

/**
 * Finds a pet in PETS by ID, coercing both sides to string so numeric/string IDs both match.
 */
function findPetById(id) {
  const target = String(id);
  return getPetsCatalog().find(function (pet) {
    return String(pet.id) === target;
  }) || null;
}

/**
 * Maps saved IDs to real PETS objects, skips & removes missing or duplicate IDs from storage,
 * and cleans up any compare selections for pets that are no longer saved.
 */
function getValidFavouritePets() {
  const rawIds = readFavouritesFromStorage();
  const catalogLoaded = typeof PETS !== 'undefined' && Array.isArray(PETS);

  if (!catalogLoaded) {
    return { savedIds: [], pets: [] };
  }

  const cleanedIds = [];
  const validPets = [];
  const seen = new Set();
  let needsCleanup = false;

  rawIds.forEach(function (rawId) {
    if (rawId === null || rawId === undefined || typeof rawId === 'object') {
      needsCleanup = true;
      return;
    }

    const key = String(rawId);
    if (seen.has(key)) {
      needsCleanup = true;
      return;
    }

    const pet = findPetById(rawId);
    if (!pet) {
      needsCleanup = true;
      return;
    }

    seen.add(key);
    cleanedIds.push(pet.id);
    validPets.push(pet);
  });

  if (needsCleanup) {
    saveFavouritesToStorage(cleanedIds);
  }

  // Keep selectedCompareIds synced with currently valid saved pets
  Array.from(selectedCompareIds).forEach(function (selectedKey) {
    if (!seen.has(selectedKey)) {
      selectedCompareIds.delete(selectedKey);
    }
  });

  return {
    savedIds: cleanedIds,
    pets: validPets
  };
}

/**
 * Formats an adoption fee amount like "Rs. 8,500".
 */
function formatFee(fee) {
  const numericFee = Number(fee);
  const safeAmount = Number.isFinite(numericFee) && numericFee >= 0 ? numericFee : 0;
  // en-US guarantees comma grouping (e.g. 8,500) across browser locales
  return 'Rs. ' + safeAmount.toLocaleString('en-US');
}

/**
 * Ensures image paths from data.js resolve cleanly from inside pages/.
 */
function resolveImagePath(imagePath) {
  if (!imagePath) {
    return '';
  }
  const trimmed = String(imagePath).trim();
  if (/^(https?:\/\/|data:|\/|\.\.\/)/i.test(trimmed)) {
    return trimmed;
  }
  return '../' + trimmed;
}

/**
 * Builds the Pet Details URL for a given pet ID.
 */
function getPetDetailsUrl(petId) {
  return '../pages/pet-details.html?id=' + encodeURIComponent(petId);
}

/**
 * Returns a sorted copy of the pets array without modifying storage order.
 */
function sortFavouritePets(pets, sortMode) {
  if (sortMode === 'fee-asc') {
    return pets.slice().sort(function (a, b) {
      return (Number(a.fee) || 0) - (Number(b.fee) || 0);
    });
  }

  if (sortMode === 'name-asc') {
    return pets.slice().sort(function (a, b) {
      return String(a.name || '').localeCompare(String(b.name || ''));
    });
  }

  // "Newest saved" is the reverse of the saved ph_favourites order
  return pets.slice().reverse();
}

// --- UI Helpers ---

/**
 * Updates the page H1 heading and the Saved Pets / Total Adoption Fees summary box.
 */
function updateHeaderAndSummary(pets) {
  const headingEl = document.getElementById('fav-heading');
  const countEl = document.getElementById('fav-count');
  const totalFeeEl = document.getElementById('fav-total-fee');

  const count = pets.length;
  headingEl.textContent = count === 1 ? 'You saved 1 pet' : 'You saved ' + count + ' pets';
  countEl.textContent = String(count);

  const totalFee = pets.reduce(function (sum, pet) {
    const fee = Number(pet.fee);
    return sum + (Number.isFinite(fee) && fee >= 0 ? fee : 0);
  }, 0);

  totalFeeEl.textContent = formatFee(totalFee);
}

/**
 * Updates the compare selection counter and disables "Compare selected" unless 2 or 3 are ticked.
 */
function updateCompareControls() {
  const countEl = document.getElementById('compare-selected-count');
  const compareBtn = document.getElementById('compare-btn');
  const selectedCount = selectedCompareIds.size;

  countEl.textContent = selectedCount + ' of ' + MAX_COMPARE + ' selected for compare';
  compareBtn.disabled = !(selectedCount === 2 || selectedCount === 3);
}

/**
 * Shows or clears the warning banner when a user tries to tick a 4th pet.
 */
function setCompareWarning(message) {
  const warningEl = document.getElementById('compare-warning');
  if (!message) {
    warningEl.textContent = '';
    warningEl.classList.add('d-none');
    return;
  }
  warningEl.textContent = message;
  warningEl.classList.remove('d-none');
}

/**
 * Creates a single pet card column element using real fields from PETS.
 */
function createFavouriteCard(pet) {
  const petIdStr = String(pet.id);
  const detailsUrl = getPetDetailsUrl(pet.id);

  const col = document.createElement('div');
  col.className = 'col-12 col-md-6 col-lg-4';

  const card = document.createElement('article');
  card.className = 'fav-card';

  // Pet image linking to Pet Details
  const imgLink = document.createElement('a');
  imgLink.href = detailsUrl;
  imgLink.className = 'fav-card-img-link';

  const img = document.createElement('img');
  img.src = resolveImagePath(pet.image);
  img.alt = (pet.name || 'Pet') + ' — ' + (pet.breed || pet.species || 'Adoptable pet');
  img.className = 'fav-card-img';
  img.loading = 'lazy';
  imgLink.appendChild(img);

  const body = document.createElement('div');
  body.className = 'fav-card-body';

  // Species badge + Adoption fee
  const topRow = document.createElement('div');
  topRow.className = 'fav-card-top';

  const speciesBadge = document.createElement('span');
  speciesBadge.className = 'fav-species-badge';
  speciesBadge.textContent = pet.species || 'Pet';

  const feeText = document.createElement('span');
  feeText.className = 'fav-fee-text';
  feeText.textContent = formatFee(pet.fee);

  topRow.appendChild(speciesBadge);
  topRow.appendChild(feeText);

  // Pet name linking to Pet Details
  const title = document.createElement('h2');
  title.className = 'fav-card-title';
  const titleLink = document.createElement('a');
  titleLink.href = detailsUrl;
  titleLink.textContent = pet.name || 'Unnamed Pet';
  title.appendChild(titleLink);

  // Species, breed, and age
  const meta = document.createElement('p');
  meta.className = 'fav-card-meta';
  const breedPart = pet.breed ? pet.breed : (pet.species || '');
  const agePart = pet.age ? ' • Age: ' + pet.age : '';
  meta.textContent = breedPart + agePart;

  // Location
  const location = document.createElement('p');
  location.className = 'fav-card-location';
  location.textContent = pet.location ? 'Location: ' + pet.location : '';

  // Compare checkbox + Remove button
  const actions = document.createElement('div');
  actions.className = 'fav-card-actions';

  const checkWrapper = document.createElement('div');
  checkWrapper.className = 'form-check fav-compare-check';

  const checkboxId = 'compare-pet-' + petIdStr;
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'form-check-input fav-compare-checkbox';
  checkbox.id = checkboxId;
  checkbox.value = petIdStr;
  checkbox.checked = selectedCompareIds.has(petIdStr);

  const checkLabel = document.createElement('label');
  checkLabel.className = 'form-check-label';
  checkLabel.htmlFor = checkboxId;
  checkLabel.textContent = 'Compare';

  checkWrapper.appendChild(checkbox);
  checkWrapper.appendChild(checkLabel);

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'btn btn-fav-remove';
  removeBtn.setAttribute('data-remove-id', petIdStr);
  removeBtn.setAttribute('aria-label', 'Remove ' + (pet.name || 'pet') + ' from favourites');
  removeBtn.textContent = 'Remove';

  actions.appendChild(checkWrapper);
  actions.appendChild(removeBtn);

  body.appendChild(topRow);
  body.appendChild(title);
  body.appendChild(meta);
  if (pet.location) {
    body.appendChild(location);
  }
  body.appendChild(actions);

  card.appendChild(imgLink);
  card.appendChild(body);
  col.appendChild(card);

  return col;
}

/**
 * Renders the favourites page (header, summary, toolbar, card grid or empty state).
 */
function renderFavouritesPage() {
  const toolbarEl = document.getElementById('fav-toolbar');
  const gridEl = document.getElementById('fav-grid');
  const emptyEl = document.getElementById('fav-empty');
  const sortSelect = document.getElementById('fav-sort');

  const data = getValidFavouritePets();
  const pets = data.pets;

  updateHeaderAndSummary(pets);

  if (pets.length === 0) {
    gridEl.innerHTML = '';
    gridEl.classList.add('d-none');
    toolbarEl.classList.add('d-none');
    emptyEl.classList.remove('d-none');
    setCompareWarning('');
    updateCompareControls();
    return;
  }

  emptyEl.classList.add('d-none');
  toolbarEl.classList.remove('d-none');
  gridEl.classList.remove('d-none');

  const sortedPets = sortFavouritePets(pets, sortSelect.value);
  const fragment = document.createDocumentFragment();

  sortedPets.forEach(function (pet) {
    fragment.appendChild(createFavouriteCard(pet));
  });

  gridEl.innerHTML = '';
  gridEl.appendChild(fragment);
  updateCompareControls();
}

// --- Action Handlers ---

/**
 * Removes a pet ID from ph_favourites and selectedCompareIds, then re-renders immediately.
 */
function handleRemovePet(petIdStr) {
  const data = getValidFavouritePets();
  const updatedIds = data.savedIds.filter(function (id) {
    return String(id) !== petIdStr;
  });

  selectedCompareIds.delete(petIdStr);
  saveFavouritesToStorage(updatedIds);

  if (selectedCompareIds.size < MAX_COMPARE) {
    setCompareWarning('');
  }

  renderFavouritesPage();
}

/**
 * Handles toggling a "Compare" checkbox, enforcing a maximum of 3 selected pets.
 */
function handleCompareToggle(checkbox) {
  const petIdStr = checkbox.value;

  if (checkbox.checked) {
    if (selectedCompareIds.size >= MAX_COMPARE) {
      // Uncheck the 4th selection and show a clear warning
      checkbox.checked = false;
      setCompareWarning('You can compare a maximum of 3 pets at a time. Uncheck one to select another.');
      return;
    }
    selectedCompareIds.add(petIdStr);
    setCompareWarning('');
  } else {
    selectedCompareIds.delete(petIdStr);
    setCompareWarning('');
  }

  updateCompareControls();
}

/**
 * Builds the side-by-side comparison table inside the Bootstrap modal and opens it.
 */
function handleOpenCompareModal() {
  if (selectedCompareIds.size < 2 || selectedCompareIds.size > MAX_COMPARE) {
    return;
  }

  const sortSelect = document.getElementById('fav-sort');
  const sortedPets = sortFavouritePets(getValidFavouritePets().pets, sortSelect.value);
  const selectedPets = sortedPets.filter(function (pet) {
    return selectedCompareIds.has(String(pet.id));
  });

  if (selectedPets.length < 2) {
    return;
  }

  const headEl = document.getElementById('compare-table-head');
  const bodyEl = document.getElementById('compare-table-body');
  headEl.innerHTML = '';
  bodyEl.innerHTML = '';

  // Table header row: empty label column + one column per selected pet
  const headRow = document.createElement('tr');
  const cornerTh = document.createElement('th');
  cornerTh.scope = 'col';
  cornerTh.textContent = 'Attribute';
  headRow.appendChild(cornerTh);

  selectedPets.forEach(function (pet) {
    const th = document.createElement('th');
    th.scope = 'col';

    const thumb = document.createElement('img');
    thumb.src = resolveImagePath(pet.image);
    thumb.alt = (pet.name || 'Pet') + ' photo';
    thumb.className = 'fav-compare-thumb';

    const link = document.createElement('a');
    link.href = getPetDetailsUrl(pet.id);
    link.className = 'fav-compare-pet-link';
    link.textContent = pet.name || 'Unnamed Pet';

    th.appendChild(thumb);
    th.appendChild(link);
    headRow.appendChild(th);
  });
  headEl.appendChild(headRow);

  // Real fields from PETS: { id, name, species, breed, age, fee, image, location, temperament }
  const rows = [
    { label: 'Species', getValue: function (p) { return p.species || '—'; } },
    { label: 'Breed', getValue: function (p) { return p.breed || '—'; } },
    { label: 'Age', getValue: function (p) { return p.age || '—'; } },
    { label: 'Adoption Fee', getValue: function (p) { return formatFee(p.fee); } },
    { label: 'Location', getValue: function (p) { return p.location || '—'; } },
    { label: 'Temperament', getValue: function (p) { return p.temperament || '—'; } }
  ];

  rows.forEach(function (rowDef) {
    const tr = document.createElement('tr');
    const rowHeader = document.createElement('th');
    rowHeader.scope = 'row';
    rowHeader.textContent = rowDef.label;
    tr.appendChild(rowHeader);

    selectedPets.forEach(function (pet) {
      const td = document.createElement('td');
      td.textContent = rowDef.getValue(pet);
      tr.appendChild(td);
    });

    bodyEl.appendChild(tr);
  });

  const modalEl = document.getElementById('compare-modal');
  if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
  }
}

// --- Page Initialization ---

/**
 * Attaches UI event listeners and performs the initial render on DOMContentLoaded.
 */
function initFavouritesPage() {
  const sortSelect = document.getElementById('fav-sort');
  const gridEl = document.getElementById('fav-grid');
  const compareBtn = document.getElementById('compare-btn');

  sortSelect.addEventListener('change', function () {
    setCompareWarning('');
    renderFavouritesPage();
  });

  // Event delegation on #fav-grid for Remove buttons and Compare checkboxes
  gridEl.addEventListener('click', function (event) {
    const removeBtn = event.target.closest('[data-remove-id]');
    if (removeBtn) {
      handleRemovePet(removeBtn.getAttribute('data-remove-id'));
    }
  });

  gridEl.addEventListener('change', function (event) {
    if (event.target.classList.contains('fav-compare-checkbox')) {
      handleCompareToggle(event.target);
    }
  });

  compareBtn.addEventListener('click', handleOpenCompareModal);

  renderFavouritesPage();
}

document.addEventListener('DOMContentLoaded', initFavouritesPage);
