/* ==========================================================================
   Paw Home - Browse Pets Page Script (js/pets.js)
   ==========================================================================
   Handles:
     1. Restoring filters from localStorage ('ph_filters') and URL (?species=)
     2. Single applyFilters() function that reads controls, saves ph_filters,
        filters and sorts PETS, renders cards via template strings, and updates
        the 'Showing X pets' count
     3. Empty state ('No pets match your search') with 'Clear filters' button
     4. Heart button toggling ph_favourites in localStorage via storage.js,
        updating aria-pressed, heart icon state, and navbar Favourites badge
     5. Resilient handling of corrupted localStorage and missing pet images
   ========================================================================== */

(function () {
  "use strict";

  var FILTERS_KEY = "ph_filters";
  var FAVOURITES_KEY = "ph_favourites";

  var VALID_SPECIES = ["Dog", "Cat", "Rabbit", "Bird"];
  var VALID_SIZES = ["Small", "Medium", "Large"];
  var VALID_CITIES = ["Islamabad", "Rawalpindi", "Lahore"];
  var VALID_AGES = ["under-1", "1-2", "2-plus"];
  var VALID_SORTS = ["newest", "age-asc", "fee-asc", "name-asc"];

  /**
   * Returns a clean default filter state object.
   * @returns {Object}
   */
  function getDefaultFilters() {
    return {
      search: "",
      sort: "newest",
      species: "",
      size: "",
      city: "",
      age: "",
      vaccinated: false
    };
  }

  /**
   * Escapes HTML special characters before interpolating strings into templates.
   * @param {*} value
   * @returns {string}
   */
  function escapeHtml(value) {
    return String(value === null || value === undefined ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /**
   * Formats age in months into a readable label (e.g. "2 years", "10 months").
   * @param {number} ageMonths
   * @returns {string}
   */
  function formatAge(ageMonths) {
    var months = Number(ageMonths);
    if (!Number.isFinite(months) || months < 0) {
      return "Unknown";
    }
    if (months < 12) {
      return months + (months === 1 ? " month" : " months");
    }
    var years = Math.floor(months / 12);
    var remainder = months % 12;
    if (remainder === 0) {
      return years + (years === 1 ? " year" : " years");
    }
    return years + " yr " + remainder + " mo";
  }

  /**
   * Formats an adoption fee in PKR or returns "Free" when 0.
   * @param {number} fee
   * @returns {string}
   */
  function formatFee(fee) {
    var amount = Number(fee);
    if (!Number.isFinite(amount) || amount <= 0) {
      return "Free";
    }
    return "PKR " + amount.toLocaleString("en-PK");
  }

  /**
   * Parses a posted date string safely into a timestamp for sorting.
   * @param {string} dateStr
   * @returns {number}
   */
  function parsePostedTime(dateStr) {
    var timestamp = Date.parse(dateStr);
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  /**
   * Reads saved favourite pet IDs from localStorage via storage.js.
   * Safely recovers if localStorage contains corrupted or non-array data.
   * @returns {number[]}
   */
  function getFavourites() {
    var raw = typeof getItem === "function" ? getItem(FAVOURITES_KEY, []) : [];
    if (!Array.isArray(raw)) {
      return [];
    }

    var seen = {};
    var cleanIds = [];
    raw.forEach(function (entry) {
      var id = Number(entry);
      if (Number.isFinite(id) && id > 0 && !seen[id]) {
        seen[id] = true;
        cleanIds.push(id);
      }
    });
    return cleanIds;
  }

  /**
   * Saves favourite pet IDs to localStorage and refreshes the navbar badge.
   * @param {number[]} favIds
   */
  function saveFavourites(favIds) {
    if (typeof setItem === "function") {
      setItem(FAVOURITES_KEY, favIds);
    }

    if (window.pawLayout && typeof window.pawLayout.updateFavouritesBadge === "function") {
      window.pawLayout.updateFavouritesBadge();
    } else {
      var badge = document.getElementById("nav-fav-count");
      if (badge) {
        badge.textContent = String(favIds.length);
      }
    }
  }

  /**
   * Toggles a pet ID inside localStorage key 'ph_favourites'.
   * @param {number} petId
   * @returns {boolean} True if the pet is now favourited, false if removed.
   */
  function toggleFavourite(petId) {
    var id = Number(petId);
    if (!Number.isFinite(id)) {
      return false;
    }

    var favs = getFavourites();
    var index = favs.indexOf(id);
    var isNowFav = false;

    if (index === -1) {
      favs.push(id);
      isNowFav = true;
    } else {
      favs.splice(index, 1);
      isNowFav = false;
    }

    saveFavourites(favs);
    return isNowFav;
  }

  /**
   * Validates and normalizes a filter object loaded from localStorage.
   * Prevents corrupted values from breaking controls or filtering.
   * @param {*} raw
   * @returns {Object}
   */
  function sanitizeFilters(raw) {
    var defaults = getDefaultFilters();
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return defaults;
    }

    return {
      search: typeof raw.search === "string" ? raw.search : "",
      sort: VALID_SORTS.indexOf(raw.sort) !== -1 ? raw.sort : defaults.sort,
      species: VALID_SPECIES.indexOf(raw.species) !== -1 ? raw.species : "",
      size: VALID_SIZES.indexOf(raw.size) !== -1 ? raw.size : "",
      city: VALID_CITIES.indexOf(raw.city) !== -1 ? raw.city : "",
      age: VALID_AGES.indexOf(raw.age) !== -1 ? raw.age : "",
      vaccinated: raw.vaccinated === true
    };
  }

  /**
   * Matches a URL ?species= parameter case-insensitively against valid species.
   * @param {string|null} value
   * @returns {string} Normalized species name or empty string if invalid.
   */
  function normalizeSpeciesParam(value) {
    if (typeof value !== "string") {
      return "";
    }
    var trimmed = value.trim().toLowerCase();
    for (var i = 0; i < VALID_SPECIES.length; i += 1) {
      if (VALID_SPECIES[i].toLowerCase() === trimmed) {
        return VALID_SPECIES[i];
      }
    }
    return "";
  }

  /**
   * Writes a filter state object into all DOM filter/search/sort controls.
   * @param {Object} filters
   */
  function setControlsFromFilters(filters) {
    var searchEl = document.getElementById("search");
    var sortEl = document.getElementById("sort");
    var speciesEl = document.getElementById("filter-species");
    var sizeEl = document.getElementById("filter-size");
    var cityEl = document.getElementById("filter-city");
    var ageEl = document.getElementById("filter-age");
    var vaccinatedEl = document.getElementById("filter-vaccinated");

    if (searchEl) searchEl.value = filters.search;
    if (sortEl) sortEl.value = filters.sort;
    if (speciesEl) speciesEl.value = filters.species;
    if (sizeEl) sizeEl.value = filters.size;
    if (cityEl) cityEl.value = filters.city;
    if (ageEl) ageEl.value = filters.age;
    if (vaccinatedEl) vaccinatedEl.checked = Boolean(filters.vaccinated);
  }

  /**
   * Restores saved filters from localStorage ('ph_filters') and applies ?species=
   * from the URL query string if present.
   */
  function restoreFilters() {
    var savedRaw = typeof getItem === "function" ? getItem(FILTERS_KEY, null) : null;
    var filters = sanitizeFilters(savedRaw);

    // URL query parameter (?species=Dog, etc.) takes precedence over saved species
    try {
      var params = new URLSearchParams(window.location.search);
      if (params.has("species")) {
        var urlSpecies = normalizeSpeciesParam(params.get("species"));
        if (urlSpecies) {
          filters.species = urlSpecies;
        }
      }
    } catch (err) {
      // Ignore malformed URLs safely
    }

    setControlsFromFilters(filters);
  }

  /**
   * Resets all search, sort, and filter controls back to defaults and re-renders.
   */
  function resetFilters() {
    var defaults = getDefaultFilters();
    setControlsFromFilters(defaults);
    if (typeof setItem === "function") {
      setItem(FILTERS_KEY, defaults);
    }
    applyFilters();
  }

  /**
   * Returns an inline SVG icon for the heart button (filled when favourited,
   * outline when not favourited).
   * @param {boolean} isFav
   * @returns {string}
   */
  function getHeartIconSvg(isFav) {
    var fill = isFav ? "currentColor" : "none";
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>`;
  }

  /**
   * Builds the HTML template string for a single pet card in #pet-grid.
   * @param {Object} pet
   * @param {boolean} isFav
   * @returns {string}
   */
  function buildPetCardHtml(pet, isFav) {
    var id = Number(pet.id);
    var safeName = escapeHtml(pet.name || "Unnamed Pet");
    var safeBreed = escapeHtml(pet.breed || "Mixed Breed");
    var safeCity = escapeHtml(pet.city || "Unknown");
    var safeAge = escapeHtml(formatAge(pet.ageMonths));
    var safeFee = escapeHtml(formatFee(pet.fee));
    var imgSrc = pet.image ? `../${escapeHtml(pet.image)}` : "";
    var favLabel = isFav
      ? `Remove ${safeName} from favourites`
      : `Add ${safeName} to favourites`;

    // Build status badges (vaccinated, good with kids)
    var badgesHtml = "";
    if (pet.vaccinated) {
      badgesHtml += `<span class="paw-badge paw-badge-teal">Vaccinated</span>`;
    }
    if (pet.goodWithKids) {
      badgesHtml += `<span class="paw-badge paw-badge-orange">Good with kids</span>`;
    }

    return `
      <div class="col-12 col-md-6 col-lg-4">
        <article class="paw-card pet-card">
          <div class="paw-card-img-wrap">
            <img
              src="${imgSrc}"
              alt="${safeName} the ${safeBreed}"
              class="paw-card-img"
              onerror="this.onerror=null; pawLayout.handleImageError(this);"
            >
            <button
              type="button"
              class="pet-fav-btn${isFav ? " is-favourite" : ""}"
              data-pet-id="${id}"
              aria-pressed="${isFav ? "true" : "false"}"
              aria-label="${favLabel}"
            >
              ${getHeartIconSvg(isFav)}
            </button>
          </div>

          <div class="paw-card-body">
            <h2 class="paw-card-title">${safeName}</h2>
            <p class="paw-card-meta">${safeBreed}</p>

            <ul class="pet-card-details">
              <li class="pet-card-detail-row">
                <span class="pet-card-detail-label">Age</span>
                <span class="pet-card-detail-value">${safeAge}</span>
              </li>
              <li class="pet-card-detail-row">
                <span class="pet-card-detail-label">City</span>
                <span class="pet-card-detail-value">${safeCity}</span>
              </li>
              <li class="pet-card-detail-row">
                <span class="pet-card-detail-label">Adoption Fee</span>
                <span class="pet-card-detail-value">${safeFee}</span>
              </li>
            </ul>

            ${badgesHtml ? `<div class="pet-card-badges">${badgesHtml}</div>` : ""}

            <a
              href="pet-details.html?id=${encodeURIComponent(id)}"
              class="btn-paw w-100 mt-auto"
              aria-label="View details for ${safeName}"
            >View</a>
          </div>
        </article>
      </div>
    `;
  }

  /**
   * Reads all filter, search, and sort controls, persists them to localStorage
   * ('ph_filters'), filters and sorts PETS, renders cards into #pet-grid using
   * template strings, and updates the 'Showing X pets' count.
   */
  function applyFilters() {
    var searchEl = document.getElementById("search");
    var sortEl = document.getElementById("sort");
    var speciesEl = document.getElementById("filter-species");
    var sizeEl = document.getElementById("filter-size");
    var cityEl = document.getElementById("filter-city");
    var ageEl = document.getElementById("filter-age");
    var vaccinatedEl = document.getElementById("filter-vaccinated");
    var gridEl = document.getElementById("pet-grid");
    var countEl = document.getElementById("results-count");

    if (!gridEl) {
      return;
    }

    // 1. Read current values from every control
    var rawSearch = searchEl ? searchEl.value : "";
    var query = rawSearch.trim().toLowerCase();
    var sortBy = sortEl ? sortEl.value : "newest";
    var species = speciesEl ? speciesEl.value : "";
    var size = sizeEl ? sizeEl.value : "";
    var city = cityEl ? cityEl.value : "";
    var ageRange = ageEl ? ageEl.value : "";
    var vaccinatedOnly = vaccinatedEl ? vaccinatedEl.checked : false;

    // 2. Save active filters in localStorage key 'ph_filters'
    if (typeof setItem === "function") {
      setItem(FILTERS_KEY, {
        search: rawSearch,
        sort: sortBy,
        species: species,
        size: size,
        city: city,
        age: ageRange,
        vaccinated: vaccinatedOnly
      });
    }

    // 3. Filter PETS safely
    var dataset = typeof PETS !== "undefined" && Array.isArray(PETS) ? PETS : [];
    var filtered = dataset.filter(function (pet) {
      if (!pet || typeof pet !== "object") {
        return false;
      }

      if (query !== "") {
        var searchable = [
          pet.name,
          pet.breed,
          pet.species,
          pet.city,
          pet.shelter
        ]
          .join(" ")
          .toLowerCase();
        if (searchable.indexOf(query) === -1) {
          return false;
        }
      }

      if (species && pet.species !== species) {
        return false;
      }

      if (size && pet.size !== size) {
        return false;
      }

      if (city && pet.city !== city) {
        return false;
      }

      if (ageRange) {
        var months = Number(pet.ageMonths);
        if (!Number.isFinite(months)) {
          return false;
        }
        if (ageRange === "under-1" && months >= 12) {
          return false;
        }
        if (ageRange === "1-2" && (months < 12 || months > 24)) {
          return false;
        }
        if (ageRange === "2-plus" && months <= 24) {
          return false;
        }
      }

      if (vaccinatedOnly && !pet.vaccinated) {
        return false;
      }

      return true;
    });

    // 4. Sort filtered results without mutating the source PETS array
    filtered.sort(function (a, b) {
      if (sortBy === "age-asc") {
        return Number(a.ageMonths) - Number(b.ageMonths);
      }
      if (sortBy === "fee-asc") {
        return Number(a.fee) - Number(b.fee);
      }
      if (sortBy === "name-asc") {
        return String(a.name || "").localeCompare(String(b.name || ""));
      }
      // Default: 'newest'
      return parsePostedTime(b.posted) - parsePostedTime(a.posted);
    });

    // 5. Update 'Showing X pets' text
    if (countEl) {
      var total = filtered.length;
      countEl.textContent = `Showing ${total} ${total === 1 ? "pet" : "pets"}`;
    }

    // 6. Render cards or empty state using template strings
    if (filtered.length === 0) {
      gridEl.innerHTML = `
        <div class="col-12">
          <div class="pets-empty-state" role="status">
            <h2 class="pets-empty-title">No pets match your search</h2>
            <p class="pets-empty-text">
              Try adjusting your search keywords or clearing some filters to see more pets.
            </p>
            <button type="button" id="clear-filters-btn" class="btn-paw">
              Clear filters
            </button>
          </div>
        </div>
      `;
      return;
    }

    var favs = getFavourites();
    gridEl.innerHTML = filtered
      .map(function (pet) {
        var isFav = favs.indexOf(Number(pet.id)) !== -1;
        return buildPetCardHtml(pet, isFav);
      })
      .join("");

    // Ensure already-failed cached images also show the gray placeholder
    var renderedImages = gridEl.querySelectorAll(".paw-card-img");
    renderedImages.forEach(function (img) {
      if (img.complete && img.naturalWidth === 0 && window.pawLayout) {
        window.pawLayout.handleImageError(img);
      }
    });
  }

  /**
   * Handles delegated clicks inside #pet-grid for heart buttons and 'Clear filters'.
   * @param {MouseEvent} event
   */
  function handleGridClick(event) {
    var clearBtn = event.target.closest("#clear-filters-btn");
    if (clearBtn) {
      resetFilters();
      return;
    }

    var favBtn = event.target.closest(".pet-fav-btn");
    if (!favBtn) {
      return;
    }

    var petId = Number(favBtn.getAttribute("data-pet-id"));
    var isNowFav = toggleFavourite(petId);

    favBtn.classList.toggle("is-favourite", isNowFav);
    favBtn.setAttribute("aria-pressed", isNowFav ? "true" : "false");

    // Update accessible label while preserving the pet's name from the card title
    var card = favBtn.closest(".pet-card");
    var titleEl = card ? card.querySelector(".paw-card-title") : null;
    var petName = titleEl ? titleEl.textContent.trim() : "pet";
    favBtn.setAttribute(
      "aria-label",
      isNowFav
        ? `Remove ${petName} from favourites`
        : `Add ${petName} to favourites`
    );

    favBtn.innerHTML = getHeartIconSvg(isNowFav);
  }

  /**
   * Wires up event listeners and performs initial restore + render.
   */
  function initPetsPage() {
    var searchEl = document.getElementById("search");
    var resetBtn = document.getElementById("reset-filters");
    var gridEl = document.getElementById("pet-grid");

    var selectControls = [
      document.getElementById("sort"),
      document.getElementById("filter-species"),
      document.getElementById("filter-size"),
      document.getElementById("filter-city"),
      document.getElementById("filter-age"),
      document.getElementById("filter-vaccinated")
    ];

    if (searchEl) {
      searchEl.addEventListener("input", applyFilters);
    }

    selectControls.forEach(function (control) {
      if (control) {
        control.addEventListener("change", applyFilters);
      }
    });

    if (resetBtn) {
      resetBtn.addEventListener("click", resetFilters);
    }

    if (gridEl) {
      gridEl.addEventListener("click", handleGridClick);
    }

    restoreFilters();
    applyFilters();

    // Ensure navbar favourites badge reflects valid saved IDs on initial load
    if (window.pawLayout && typeof window.pawLayout.updateFavouritesBadge === "function") {
      window.pawLayout.updateFavouritesBadge();
    }
  }

  // Expose applyFilters on window for clarity and external callers
  window.applyFilters = applyFilters;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPetsPage);
  } else {
    initPetsPage();
  }
})();
