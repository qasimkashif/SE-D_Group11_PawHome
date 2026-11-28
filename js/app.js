const PETS = [
  {
    id: "barnaby",
    name: "Barnaby",
    species: "dog",
    speciesLabel: "Dog",
    breed: "Golden Retriever Mix",
    ageGroup: "adult",
    ageText: "2 years",
    gender: "Male",
    size: "Medium (46 lbs)",
    fee: "$150",
    image: "assets/images/pet-barnaby.svg",
    badge: "Staff Favorite",
    tags: ["House-trained", "Good with kids", "Leash-pro"],
    summary:
      "Warm-hearted, gentle walker who loves sunny garden naps and greeting everyone with a soft tail wag.",
    bio: "Barnaby arrived at Paw Home as a stray and immediately charmed every volunteer. He knows sit, paw, and wait, walks calmly on a loose leash, and thrives in homes looking for an affectionate daily companion.",
    health: "Neutered, microchipped, rabies & DHPP up to date"
  },
  {
    id: "mochi",
    name: "Mochi",
    species: "cat",
    speciesLabel: "Cat",
    breed: "Cream & Ginger Tabby",
    ageGroup: "adult",
    ageText: "1.5 years",
    gender: "Female",
    size: "Small (8.5 lbs)",
    fee: "$95",
    image: "assets/images/pet-mochi.svg",
    badge: "Cuddle Bug",
    tags: ["Indoor-only", "Apartment-friendly", "Litter-trained"],
    summary:
      "Sunbeam enthusiast with velvety purrs who adores feather wands and curling up beside laptops.",
    bio: "Mochi is an easygoing young cat who settles into quiet routines fast. She loves perched window watching in the morning and gentle chin scratches at night. Great fit for apartments or calm households.",
    health: "Spayed, microchipped, FVRCP & FeLV/FIV negative"
  },
  {
    id: "luna",
    name: "Luna",
    species: "dog",
    speciesLabel: "Dog",
    breed: "Border Collie Mix",
    ageGroup: "young",
    ageText: "7 months",
    gender: "Female",
    size: "Medium (28 lbs)",
    fee: "$195",
    image: "assets/images/pet-luna.svg",
    badge: "Smart Puppy",
    tags: ["Playful", "Dog-friendly", "Quick learner"],
    summary:
      "Bright-eyed adventure buddy ready for weekend trail walks, fetch games, and agility tricks.",
    bio: "Luna is bursting with curiosity and eagerness to learn. She already sleeps quietly in her crate overnight and plays wonderfully with confident dogs. Ideal for active adopters who enjoy training and outdoor play.",
    health: "Spayed, microchipped, puppy series completed"
  },
  {
    id: "oliver",
    name: "Oliver",
    species: "cat",
    speciesLabel: "Cat",
    breed: "Grey Shorthair",
    ageGroup: "senior",
    ageText: "6 years",
    gender: "Male",
    size: "Medium (11 lbs)",
    fee: "$75",
    image: "assets/images/pet-oliver.svg",
    badge: "Gentle Senior",
    tags: ["Calm", "Cat-friendly", "Low-energy"],
    summary:
      "Dignified, affectionate gentleman seeking a peaceful couch and steady companionship.",
    bio: "Oliver came to us when his previous owner moved into assisted living. He is deeply gentle, rarely vocal, and enjoys slow brushing sessions. Seniors like Oliver settle in effortlessly and bring instant calm to any room.",
    health: "Neutered, dental cleaned, senior bloodwork clear"
  },
  {
    id: "clover",
    name: "Clover",
    species: "small",
    speciesLabel: "Small Pet",
    breed: "Holland Lop Rabbit",
    ageGroup: "adult",
    ageText: "1 year",
    gender: "Female",
    size: "Tiny (3.5 lbs)",
    fee: "$45",
    image: "assets/images/pet-clover.svg",
    badge: "Litter Trained",
    tags: ["Gentle", "Indoor pen", "Herbivore"],
    summary:
      "Soft lop-eared bunny who loves leafy greens, cardboard tunnels, and evening head rubs.",
    bio: "Clover is curious, tidy, and uses her hay-lined litter box reliably. She enjoys free-roam playtime in rabbit-proofed rooms and bonds quickly when approached softly at floor level.",
    health: "Spayed, vet wellness checked, RHDV2 vaccinated"
  },
  {
    id: "daisy",
    name: "Daisy",
    species: "dog",
    speciesLabel: "Dog",
    breed: "Tricolor Beagle Mix",
    ageGroup: "senior",
    ageText: "5 years",
    gender: "Female",
    size: "Small-Med (26 lbs)",
    fee: "$135",
    image: "assets/images/pet-daisy.svg",
    badge: "Sweet Soul",
    tags: ["Gentle", "Great with kids", "Car-ride fan"],
    summary:
      "Soulful-eyed beagle mix who thrives on neighborhood strolls and cozy evening blankets.",
    bio: "Daisy has a calm, polite demeanor that makes her wonderful around children and guests. She loves sniffing new parks, rides peacefully in the car, and never turns down a crunchy carrot treat.",
    health: "Spayed, microchipped, fully vaccinated"
  }
];

const FAVORITES_KEY = "pawhome_favorites_v1";

const state = {
  species: "all",
  age: "all",
  search: "",
  favorites: new Set(loadFavorites())
};

// DOM Elements
const petsGrid = document.getElementById("pets-grid");
const emptyState = document.getElementById("empty-state");
const resultsCounter = document.getElementById("results-counter");
const favCountBadge = document.getElementById("fav-count");
const filterTabs = document.querySelectorAll(".filter-tab");
const ageFilter = document.getElementById("age-filter");
const searchInput = document.getElementById("pet-search");
const resetFiltersBtn = document.getElementById("reset-filters-btn");
const headerFavoritesBtn = document.getElementById("header-favorites-btn");

const petModal = document.getElementById("pet-modal");
const modalContent = document.getElementById("modal-content");
const modalCloseBtn = document.getElementById("modal-close");

const inquiryForm = document.getElementById("inquiry-form");
const petInterestSelect = document.getElementById("pet-interest");
const inquiryTypeSelect = document.getElementById("inquiry-type");
const formError = document.getElementById("form-error");
const formSuccess = document.getElementById("form-success");
const successSummary = document.getElementById("success-summary");
const newInquiryBtn = document.getElementById("new-inquiry-btn");

const newsletterForm = document.getElementById("newsletter-form");
const newsletterEmail = document.getElementById("newsletter-email");
const newsletterFeedback = document.getElementById("newsletter-feedback");

const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");
const toastEl = document.getElementById("toast");

let toastTimer = null;

function loadFavorites() {
  try {
    const saved = localStorage.getItem(FAVORITES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveFavorites() {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...state.favorites]));
  } catch {
    // Ignore storage quota / private mode restrictions
  }
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.hidden = true;
  }, 2600);
}

function populatePetSelect() {
  PETS.forEach((pet) => {
    const option = document.createElement("option");
    option.value = `${pet.name} (${pet.breed})`;
    option.textContent = `${pet.name} — ${pet.breed} (${pet.ageText})`;
    petInterestSelect.appendChild(option);
  });
}

function updateFavoritesBadge() {
  favCountBadge.textContent = String(state.favorites.size);
}

function getFilteredPets() {
  const query = state.search.trim().toLowerCase();

  return PETS.filter((pet) => {
    const matchesSpecies =
      state.species === "all"
        ? true
        : state.species === "favorites"
        ? state.favorites.has(pet.id)
        : pet.species === state.species;

    const matchesAge = state.age === "all" || pet.ageGroup === state.age;

    const searchableText = [pet.name, pet.breed, pet.speciesLabel, pet.summary, ...pet.tags]
      .join(" ")
      .toLowerCase();
    const matchesQuery = !query || searchableText.includes(query);

    return matchesSpecies && matchesAge && matchesQuery;
  });
}

function renderPets() {
  const filtered = getFilteredPets();
  petsGrid.innerHTML = "";

  const petWord = filtered.length === 1 ? "pet" : "pets";
  resultsCounter.textContent = `Showing ${filtered.length} ${petWord}`;

  if (filtered.length === 0) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  filtered.forEach((pet) => {
    const isSaved = state.favorites.has(pet.id);
    const card = document.createElement("article");
    card.className = "pet-card";

    card.innerHTML = `
      <div class="pet-media">
        <img src="${pet.image}" alt="${pet.name}, a ${pet.ageText} ${pet.breed} available for adoption" loading="lazy" />
        <span class="pet-badge">${pet.badge}</span>
        <button
          type="button"
          class="fav-btn ${isSaved ? "is-saved" : ""}"
          data-fav-id="${pet.id}"
          aria-pressed="${isSaved}"
          aria-label="${isSaved ? `Remove ${pet.name} from saved pets` : `Save ${pet.name} to favorites`}"
        >
          ${isSaved ? "&hearts;" : "&#9825;"}
        </button>
      </div>
      <div class="pet-body">
        <div class="pet-title-row">
          <h3>${pet.name}</h3>
          <span class="pet-fee">${pet.fee}</span>
        </div>
        <p class="pet-meta">${pet.breed} &middot; ${pet.ageText} &middot; ${pet.gender}</p>
        <div class="pet-tags">
          ${pet.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
        </div>
        <p class="pet-summary">${pet.summary}</p>
        <div class="pet-actions">
          <button type="button" class="btn btn-outline btn-sm" data-view-id="${pet.id}">
            View Profile
          </button>
          <button type="button" class="btn btn-primary btn-sm" data-adopt-id="${pet.id}">
            Adopt ${pet.name}
          </button>
        </div>
      </div>
    `;

    petsGrid.appendChild(card);
  });
}

function setActiveSpeciesTab(speciesValue) {
  state.species = speciesValue;
  filterTabs.forEach((tab) => {
    const isActive = tab.dataset.species === speciesValue;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });
  renderPets();
}

function toggleFavorite(petId) {
  const pet = PETS.find((item) => item.id === petId);
  if (!pet) return;

  if (state.favorites.has(petId)) {
    state.favorites.delete(petId);
    showToast(`Removed ${pet.name} from saved pets`);
  } else {
    state.favorites.add(petId);
    showToast(`Saved ${pet.name} to your favorites`);
  }

  saveFavorites();
  updateFavoritesBadge();
  renderPets();
}

function openPetModal(petId) {
  const pet = PETS.find((item) => item.id === petId);
  if (!pet) return;

  modalContent.innerHTML = `
    <div class="modal-grid">
      <div class="modal-photo">
        <img src="${pet.image}" alt="${pet.name}, ${pet.breed}" />
      </div>
      <div class="modal-details">
        <span class="eyebrow">${pet.badge}</span>
        <h2 id="modal-pet-name">${pet.name}</h2>
        <p class="pet-meta">${pet.breed} &middot; ${pet.speciesLabel}</p>
        <div class="modal-facts">
          <div><span>Age</span><strong>${pet.ageText}</strong></div>
          <div><span>Size</span><strong>${pet.size}</strong></div>
          <div><span>Gender</span><strong>${pet.gender}</strong></div>
          <div><span>Adoption Fee</span><strong>${pet.fee}</strong></div>
        </div>
        <p>${pet.bio}</p>
        <p><strong>Veterinary Care:</strong> ${pet.health}</p>
        <div class="pet-tags" style="margin-bottom: 1.25rem;">
          ${pet.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
        </div>
        <button type="button" class="btn btn-primary btn-block" id="modal-adopt-btn">
          Apply to Adopt ${pet.name}
        </button>
      </div>
    </div>
  `;

  petModal.hidden = false;
  document.body.style.overflow = "hidden";
  modalCloseBtn.focus();

  const modalAdoptBtn = document.getElementById("modal-adopt-btn");
  modalAdoptBtn.addEventListener("click", () => {
    closePetModal();
    prefillAdoptionForm(pet);
  });
}

function closePetModal() {
  petModal.hidden = true;
  document.body.style.overflow = "";
}

function prefillAdoptionForm(pet) {
  inquiryTypeSelect.value = "adopt";
  petInterestSelect.value = `${pet.name} (${pet.breed})`;
  const formSection = document.getElementById("adopt-form");
  formSection.scrollIntoView({ behavior: "smooth" });
  setTimeout(() => {
    document.getElementById("applicant-name").focus({ preventScroll: true });
  }, 450);
  showToast(`Selected ${pet.name} in the adoption form`);
}

// Event Listeners
filterTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    setActiveSpeciesTab(tab.dataset.species);
  });
});

ageFilter.addEventListener("change", (event) => {
  state.age = event.target.value;
  renderPets();
});

searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderPets();
});

resetFiltersBtn.addEventListener("click", () => {
  state.age = "all";
  state.search = "";
  ageFilter.value = "all";
  searchInput.value = "";
  setActiveSpeciesTab("all");
});

headerFavoritesBtn.addEventListener("click", () => {
  setActiveSpeciesTab("favorites");
  document.getElementById("pets").scrollIntoView({ behavior: "smooth" });
});

petsGrid.addEventListener("click", (event) => {
  const favBtn = event.target.closest("[data-fav-id]");
  if (favBtn) {
    toggleFavorite(favBtn.dataset.favId);
    return;
  }

  const viewBtn = event.target.closest("[data-view-id]");
  if (viewBtn) {
    openPetModal(viewBtn.dataset.viewId);
    return;
  }

  const adoptBtn = event.target.closest("[data-adopt-id]");
  if (adoptBtn) {
    const pet = PETS.find((item) => item.id === adoptBtn.dataset.adoptId);
    if (pet) prefillAdoptionForm(pet);
  }
});

modalCloseBtn.addEventListener("click", closePetModal);
petModal.addEventListener("click", (event) => {
  if (event.target === petModal) closePetModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !petModal.hidden) {
    closePetModal();
  }
});

// Prefill inquiry type links (Foster, Volunteer, Sponsor, Visit)
document.querySelectorAll("[data-prefill-type]").forEach((link) => {
  link.addEventListener("click", () => {
    const type = link.dataset.prefillType;
    if (type === "foster") inquiryTypeSelect.value = "foster";
    else if (type === "visit") inquiryTypeSelect.value = "visit";
    else inquiryTypeSelect.value = "volunteer";
  });
});

// FAQ Accordion
document.querySelectorAll(".faq-question").forEach((button) => {
  button.addEventListener("click", () => {
    const isExpanded = button.getAttribute("aria-expanded") === "true";
    const answer = button.nextElementSibling;
    button.setAttribute("aria-expanded", String(!isExpanded));
    answer.hidden = isExpanded;
  });
});

// Mobile Menu Toggle
menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  mobileMenu.hidden = isOpen;
});

mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    mobileMenu.hidden = true;
  });
});

// Inquiry Form Submission
inquiryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  formError.hidden = true;

  const name = document.getElementById("applicant-name").value.trim();
  const email = document.getElementById("applicant-email").value.trim();
  const phone = document.getElementById("applicant-phone").value.trim();
  const inquiryLabel = inquiryTypeSelect.options[inquiryTypeSelect.selectedIndex].text;
  const petChoice = petInterestSelect.value;

  if (!name || !email || !email.includes("@") || !phone) {
    formError.textContent = "Please fill in your name, a valid email address, and phone number.";
    formError.hidden = false;
    return;
  }

  inquiryForm.hidden = true;
  formSuccess.hidden = false;
  successSummary.textContent = `Thanks, ${name}! We received your "${inquiryLabel}" request regarding ${petChoice}. An adoption counselor will reach out to ${email} within 24 hours.`;
  showToast("Inquiry sent to Paw Home!");
});

newInquiryBtn.addEventListener("click", () => {
  inquiryForm.reset();
  formSuccess.hidden = true;
  inquiryForm.hidden = false;
});

// Newsletter Subscription
newsletterForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = newsletterEmail.value.trim();
  if (!email || !email.includes("@")) {
    newsletterFeedback.textContent = "Please enter a valid email address.";
    return;
  }
  newsletterFeedback.textContent = `You're subscribed! Weekly pet alerts will arrive at ${email}.`;
  newsletterForm.reset();
});

// Initialize Page
document.getElementById("current-year").textContent = String(new Date().getFullYear());
populatePetSelect();
updateFavoritesBadge();
renderPets();
