/* ==========================================================================
   Paw Home - Home Page Script (js/home.js)
   ==========================================================================
   Handles:
     1. Image fallback placeholders for hero, carousel, and pet cards
     2. Accessible Bootstrap 5 carousel initialization (pause on hover + keyboard)
     3. Dynamic rendering of the 4 newest pets from PETS into #featured-pets
     4. Scroll-triggered impact counters using IntersectionObserver
   ========================================================================== */

(function () {
  "use strict";

  /**
   * Replaces a missing or broken image with the shared neutral gray placeholder.
   * Checks both synchronous failures (complete && naturalWidth === 0) and async errors.
   * @param {HTMLImageElement} img
   */
  function attachImageFallback(img) {
    if (!img) {
      return;
    }

    function applyPlaceholder() {
      if (window.pawLayout && typeof window.pawLayout.handleImageError === "function") {
        window.pawLayout.handleImageError(img);
      } else {
        img.onerror = null;
        img.classList.add("paw-img-missing");
      }
    }

    img.addEventListener("error", applyPlaceholder, { once: true });

    if (img.complete && img.naturalWidth === 0) {
      applyPlaceholder();
    }
  }

  /**
   * Applies gray placeholder fallbacks to static images in the hero and carousel.
   */
  function initStaticImages() {
    var images = document.querySelectorAll(".home-hero-img, .home-slide-img");
    images.forEach(function (img) {
      attachImageFallback(img);
    });
  }

  /**
   * Initializes the 3-slide highlights carousel with hover pause and keyboard support.
   */
  function initCarousel() {
    var carouselEl = document.getElementById("homeCarousel");
    if (!carouselEl || typeof window.bootstrap === "undefined" || !window.bootstrap.Carousel) {
      return;
    }

    window.bootstrap.Carousel.getOrCreateInstance(carouselEl, {
      interval: 5000,
      pause: "hover",
      keyboard: true,
      ride: "carousel",
      wrap: true
    });
  }

  /**
   * Formats a pet's age in months into a readable string (e.g. "2 years", "10 months").
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
   * Formats an adoption fee in PKR or shows "Free" when 0.
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
   * Parses a posted date string safely into a numeric timestamp for sorting.
   * @param {string} dateStr
   * @returns {number}
   */
  function parsePostedTime(dateStr) {
    var time = Date.parse(dateStr);
    return Number.isNaN(time) ? 0 : time;
  }

  /**
   * Returns up to `count` newest pets sorted by `posted` date descending.
   * @param {Array} pets
   * @param {number} count
   * @returns {Array}
   */
  function getNewestPets(pets, count) {
    return pets
      .slice()
      .sort(function (a, b) {
        return parsePostedTime(b && b.posted) - parsePostedTime(a && a.posted);
      })
      .slice(0, count);
  }

  /**
   * Creates a single pet card column element for #featured-pets.
   * @param {Object} pet
   * @returns {HTMLElement}
   */
  function createPetCard(pet) {
    var col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-lg-3";

    var card = document.createElement("article");
    card.className = "paw-card home-pet-card";

    // Photo area with gray placeholder fallback if missing
    var imgWrap = document.createElement("div");
    imgWrap.className = "paw-card-img-wrap";

    var img = document.createElement("img");
    img.src = pet && pet.image ? pet.image : "";
    img.alt = (pet && pet.name ? pet.name : "Adoptable pet") +
      (pet && pet.breed ? " the " + pet.breed : "");
    img.className = "paw-card-img";
    attachImageFallback(img);
    imgWrap.appendChild(img);

    // Card body
    var body = document.createElement("div");
    body.className = "paw-card-body";

    var title = document.createElement("h3");
    title.className = "paw-card-title";
    title.textContent = pet && pet.name ? pet.name : "Unnamed Pet";

    var breed = document.createElement("p");
    breed.className = "paw-card-meta";
    breed.textContent = pet && pet.breed ? pet.breed : "Mixed Breed";

    // Age and Fee rows
    var details = document.createElement("ul");
    details.className = "home-pet-details";

    var ageRow = document.createElement("li");
    ageRow.className = "home-pet-detail-row";
    var ageLabel = document.createElement("span");
    ageLabel.className = "home-pet-detail-label";
    ageLabel.textContent = "Age";
    var ageVal = document.createElement("span");
    ageVal.className = "home-pet-detail-value";
    ageVal.textContent = formatAge(pet && pet.ageMonths);
    ageRow.appendChild(ageLabel);
    ageRow.appendChild(ageVal);

    var feeRow = document.createElement("li");
    feeRow.className = "home-pet-detail-row";
    var feeLabel = document.createElement("span");
    feeLabel.className = "home-pet-detail-label";
    feeLabel.textContent = "Adoption Fee";
    var feeVal = document.createElement("span");
    feeVal.className = "home-pet-detail-value";
    feeVal.textContent = formatFee(pet && pet.fee);
    feeRow.appendChild(feeLabel);
    feeRow.appendChild(feeVal);

    details.appendChild(ageRow);
    details.appendChild(feeRow);

    // View link to pet details page
    var actionWrap = document.createElement("div");
    actionWrap.className = "mt-auto pt-2";

    var viewLink = document.createElement("a");
    var petId = pet && pet.id !== undefined ? encodeURIComponent(String(pet.id)) : "";
    viewLink.href = "pages/pet-details.html?id=" + petId;
    viewLink.className = "btn-paw w-100";
    viewLink.textContent = "View";
    viewLink.setAttribute(
      "aria-label",
      "View details for " + (pet && pet.name ? pet.name : "pet")
    );

    actionWrap.appendChild(viewLink);

    body.appendChild(title);
    body.appendChild(breed);
    body.appendChild(details);
    body.appendChild(actionWrap);

    card.appendChild(imgWrap);
    card.appendChild(body);
    col.appendChild(card);

    return col;
  }

  /**
   * Renders the 4 newest pets from PETS into #featured-pets, or shows an empty message.
   */
  function renderFeaturedPets() {
    var container = document.getElementById("featured-pets");
    if (!container) {
      return;
    }

    container.innerHTML = "";

    if (typeof PETS === "undefined" || !Array.isArray(PETS) || PETS.length === 0) {
      var emptyCol = document.createElement("div");
      emptyCol.className = "col-12";

      var emptyMsg = document.createElement("p");
      emptyMsg.className = "home-empty-state";
      emptyMsg.setAttribute("role", "status");
      emptyMsg.textContent = "No pets available right now";

      emptyCol.appendChild(emptyMsg);
      container.appendChild(emptyCol);
      return;
    }

    var newestPets = getNewestPets(PETS, 4);
    var fragment = document.createDocumentFragment();

    newestPets.forEach(function (pet) {
      fragment.appendChild(createPetCard(pet));
    });

    container.appendChild(fragment);
  }

  /**
   * Animates a counter element smoothly from 0 up to its data-target value.
   * @param {HTMLElement} counterEl
   */
  function animateCounter(counterEl) {
    var target = parseInt(counterEl.getAttribute("data-target"), 10);
    if (!Number.isFinite(target) || target < 0) {
      return;
    }

    // Respect user reduced-motion preferences
    var prefersReducedMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || typeof window.requestAnimationFrame !== "function") {
      counterEl.textContent = String(target);
      return;
    }

    var duration = 1200;
    var startTime = null;

    function step(timestamp) {
      if (startTime === null) {
        startTime = timestamp;
      }
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic for natural deceleration
      var eased = 1 - Math.pow(1 - progress, 3);
      var currentValue = Math.round(eased * target);

      counterEl.textContent = String(currentValue);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        counterEl.textContent = String(target);
      }
    }

    counterEl.textContent = "0";
    window.requestAnimationFrame(step);
  }

  /**
   * Observes #our-impact counters and starts count-up from 0 when scrolled into view.
   * Uses in-memory tracking only so reloading the page always replays the animation.
   */
  function initImpactCounters() {
    var counters = document.querySelectorAll(".home-counter-number[data-target]");
    if (!counters.length) {
      return;
    }

    // Always reset visible text to 0 at initialization
    counters.forEach(function (counterEl) {
      counterEl.textContent = "0";
      counterEl.dataset.animated = "false";
    });

    if (!("IntersectionObserver" in window)) {
      counters.forEach(function (counterEl) {
        counterEl.dataset.animated = "true";
        animateCounter(counterEl);
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && entry.target.dataset.animated !== "true") {
            entry.target.dataset.animated = "true";
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.25
      }
    );

    counters.forEach(function (counterEl) {
      observer.observe(counterEl);
    });
  }

  /**
   * Boots all Home page features after DOM is ready.
   */
  function initHome() {
    initStaticImages();
    initCarousel();
    renderFeaturedPets();
    initImpactCounters();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHome);
  } else {
    initHome();
  }
})();
