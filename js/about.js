/* ==========================================================================
   Paw Home - About Page Script (js/about.js)
   ==========================================================================
   1. Defines the STATS array and renders cards into #stats using .map().
   2. Animates numbers from 0 to their target value when #stats scrolls into
      view (via IntersectionObserver), or shows final numbers immediately if
      the user prefers reduced motion.
   ========================================================================== */

(function () {
  // Stats data array: { label, value, suffix }
  var STATS = [
    { label: "Pets Adopted", value: 120, suffix: "" },
    { label: "Partner Shelters", value: 6, suffix: "" },
    { label: "Cities", value: 3, suffix: "" },
    { label: "Volunteer Helpers", value: 85, suffix: "" }
  ];

  // Track whether the count-up animation has already run once
  var hasAnimated = false;

  /**
   * Checks if the user enabled "Reduce Motion" in their OS or browser settings.
   * @returns {boolean}
   */
  function prefersReducedMotion() {
    return (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  /**
   * Renders the STATS cards into #stats using Array.prototype.map().
   * Shows a fallback message if STATS is missing or empty.
   */
  function renderStats() {
    var statsContainer = document.getElementById("stats");
    if (!statsContainer) {
      return;
    }

    // Edge case: missing or empty STATS array
    if (!Array.isArray(STATS) || STATS.length === 0) {
      statsContainer.innerHTML =
        '<div class="col-12">' +
        '<p class="mb-0 text-center">Impact statistics are currently unavailable.</p>' +
        "</div>";
      return;
    }

    var startImmediately = prefersReducedMotion() || typeof IntersectionObserver !== "function";

    // Build each Bootstrap grid card with .map()
    var cardsHtml = STATS.map(function (stat, index) {
      var suffix = stat.suffix ? String(stat.suffix) : "";
      var initialDisplay = startImmediately ? String(stat.value) + suffix : "0" + suffix;

      return (
        '<div class="col-12 col-md-6 col-lg-3">' +
        '<article class="paw-card about-stat-card">' +
        '<div class="paw-card-body justify-content-center">' +
        '<p class="about-stat-number" data-stat-index="' +
        index +
        '">' +
        initialDisplay +
        "</p>" +
        '<h3 class="about-stat-label">' +
        stat.label +
        "</h3>" +
        "</div>" +
        "</article>" +
        "</div>"
      );
    }).join("");

    statsContainer.innerHTML = cardsHtml;
  }

  /**
   * Smoothly animates a single stat element from 0 up to targetValue.
   * @param {HTMLElement} element
   * @param {number} targetValue
   * @param {string} suffix
   */
  function animateSingleStat(element, targetValue, suffix) {
    var durationMs = 1000;
    var startTime = null;

    function step(timestamp) {
      if (startTime === null) {
        startTime = timestamp;
      }
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / durationMs, 1);
      var currentNumber = Math.round(progress * targetValue);

      element.textContent = String(currentNumber) + suffix;

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        element.textContent = String(targetValue) + suffix;
      }
    }

    window.requestAnimationFrame(step);
  }

  /**
   * Runs the count-up animation for every rendered stat card once.
   */
  function startCountUp() {
    if (hasAnimated || !Array.isArray(STATS) || STATS.length === 0) {
      return;
    }
    hasAnimated = true;

    STATS.forEach(function (stat, index) {
      var el = document.querySelector('[data-stat-index="' + index + '"]');
      if (!el) {
        return;
      }
      var target = Number(stat.value) || 0;
      var suffix = stat.suffix ? String(stat.suffix) : "";
      animateSingleStat(el, target, suffix);
    });
  }

  /**
   * Uses IntersectionObserver to start counting when #stats enters the screen.
   */
  function observeStatsRow() {
    var statsContainer = document.getElementById("stats");
    if (!statsContainer || !Array.isArray(STATS) || STATS.length === 0) {
      return;
    }

    // Respect reduced motion preference and older browsers without IntersectionObserver
    if (prefersReducedMotion() || typeof IntersectionObserver !== "function") {
      hasAnimated = true;
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            startCountUp();
            observer.unobserve(statsContainer);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(statsContainer);
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderStats();
    observeStatsRow();
  });
})();
