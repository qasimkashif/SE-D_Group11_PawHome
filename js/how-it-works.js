/* ==========================================================================
   Paw Home - How It Works Page Script (js/how-it-works.js)
   ==========================================================================
   Drives the 5-step adoption stepper from the STEPS array:
   - Renders all 5 step buttons and the active step content panel.
   - Supports clicking step buttons, Previous/Next buttons, and Left/Right
     arrow keys when a step button is focused.
   - Highlights the active step and marks completed steps with a teal tick.
   ========================================================================== */

(function () {
  // Ordered array of 5 adoption steps: { title, text, imageAlt, link }
  var STEPS = [
    {
      title: "Browse",
      text: "Explore dogs, cats, rabbits, and birds waiting at verified shelters in Islamabad, Rawalpindi, and Lahore. Filter by species, energy level, and vaccination status to find a good match for your home.",
      imageAlt: "Illustration showing a visitor browsing adoptable pet profiles on Paw Home",
      link: { label: "Browse Pets", href: "../pages/pets.html" }
    },
    {
      title: "Apply",
      text: "Complete our short adoption application online with your household setup, daily routine, and CNIC details. Partner shelters usually review applications within 24 to 48 hours.",
      imageAlt: "Illustration representing an online Paw Home adoption application form",
      link: { label: "Go to Adoption Application", href: "../pages/adopt.html" }
    },
    {
      title: "Home Visit",
      text: "A shelter coordinator checks that your indoor space, balcony mesh, or yard is safe for your chosen pet. For apartments and shared homes, they also confirm landlord or family approval.",
      imageAlt: "Illustration of a shelter coordinator reviewing a pet-safe home environment",
      link: null
    },
    {
      title: "Meet Your Pet",
      text: "Visit the Islamabad or Rawalpindi partner shelter in person to spend quiet time with your shortlisted pet, ask caregivers about diet and habits, and make sure everyone bonds comfortably.",
      imageAlt: "Illustration of an adopter meeting a friendly dog and cat at an Islamabad shelter",
      link: null
    },
    {
      title: "Take Home",
      text: "Sign the adoption agreement, collect the pet's vaccination record, and bring your new companion home in a secure carrier or on a sturdy leash.",
      imageAlt: "Illustration of a happy adopter taking their new pet home from the shelter",
      link: null
    }
  ];

  // Zero-based index of the currently selected step (0 = Step 1)
  var currentStep = 0;

  /**
   * Changes the active step safely within bounds and re-renders the UI.
   * @param {number} newIndex
   * @param {boolean} [focusButton=false] - Focus the active step button after rendering.
   */
  function goToStep(newIndex, focusButton) {
    if (!Array.isArray(STEPS) || STEPS.length === 0) {
      return;
    }
    if (newIndex < 0 || newIndex >= STEPS.length) {
      return;
    }
    currentStep = newIndex;
    renderStepper();

    if (focusButton) {
      var activeBtn = document.querySelector('#stepper-buttons button[aria-current="step"]');
      if (activeBtn) {
        activeBtn.focus();
      }
    }
  }

  /**
   * Renders the 5 step buttons into #stepper-buttons.
   */
  function renderStepButtons() {
    var navContainer = document.getElementById("stepper-buttons");
    if (!navContainer) {
      return;
    }

    navContainer.innerHTML = "";

    STEPS.forEach(function (step, index) {
      var isActive = index === currentStep;
      var isCompleted = index < currentStep;
      var titleText = step && step.title ? step.title : "Step " + (index + 1);

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "hiw-step-btn";
      if (isActive) {
        btn.classList.add("is-active");
        btn.setAttribute("aria-current", "step");
      } else if (isCompleted) {
        btn.classList.add("is-completed");
      }

      // Badge shows a teal tick for completed steps, or the step number otherwise
      var badge = document.createElement("span");
      badge.className = "hiw-step-badge";
      badge.setAttribute("aria-hidden", "true");
      badge.textContent = isCompleted ? "\u2713" : String(index + 1);

      var label = document.createElement("span");
      label.textContent = index + 1 + " " + titleText;

      btn.appendChild(badge);
      btn.appendChild(label);

      // Click to jump directly to this step
      btn.addEventListener("click", function () {
        goToStep(index, false);
      });

      // Keyboard navigation with Left and Right arrow keys
      btn.addEventListener("keydown", function (event) {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          if (index < STEPS.length - 1) {
            goToStep(index + 1, true);
          }
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          if (index > 0) {
            goToStep(index - 1, true);
          }
        }
      });

      navContainer.appendChild(btn);
    });
  }

  /**
   * Renders the active step picture area, title, description, and optional link.
   */
  function renderStepPanel() {
    var panel = document.getElementById("step-panel");
    if (!panel) {
      return;
    }

    // Fallback guard if STEPS is missing or empty
    if (!Array.isArray(STEPS) || STEPS.length === 0) {
      panel.innerHTML =
        '<div class="paw-card-body"><p class="mb-0">Adoption steps are currently unavailable.</p></div>';
      return;
    }

    var step = STEPS[currentStep] || {};
    var safeTitle = step.title || "Adoption Step";
    var safeText = step.text || "Details for this adoption step will be added soon.";
    var safeAlt = step.imageAlt || "Visual placeholder for step " + (currentStep + 1);

    panel.innerHTML = "";

    var body = document.createElement("div");
    body.className = "paw-card-body";

    var row = document.createElement("div");
    row.className = "row g-4 align-items-center";

    // Left column: CSS picture placeholder with meaningful aria-label
    var imgCol = document.createElement("div");
    imgCol.className = "col-12 col-md-5";

    var pictureBox = document.createElement("div");
    pictureBox.className = "hiw-picture-box";
    pictureBox.setAttribute("role", "img");
    pictureBox.setAttribute("aria-label", safeAlt);

    var picNumber = document.createElement("div");
    picNumber.className = "hiw-picture-number";
    picNumber.setAttribute("aria-hidden", "true");
    picNumber.textContent = String(currentStep + 1);

    var picLabel = document.createElement("p");
    picLabel.className = "hiw-picture-label mb-0";
    picLabel.textContent = safeAlt;

    pictureBox.appendChild(picNumber);
    pictureBox.appendChild(picLabel);
    imgCol.appendChild(pictureBox);

    // Right column: Step badge, heading, paragraph, and optional CTA link
    var textCol = document.createElement("div");
    textCol.className = "col-12 col-md-7";

    var stepTag = document.createElement("span");
    stepTag.className = "paw-badge paw-badge-orange mb-2";
    stepTag.textContent = "Step " + (currentStep + 1) + " of " + STEPS.length;

    var heading = document.createElement("h3");
    heading.className = "h3 mb-2";
    heading.textContent = safeTitle;

    var paragraph = document.createElement("p");
    paragraph.className = "mb-3";
    paragraph.textContent = safeText;

    textCol.appendChild(stepTag);
    textCol.appendChild(heading);
    textCol.appendChild(paragraph);

    // Optional step action button (e.g., Step 1 -> pets.html, Step 2 -> adopt.html)
    if (step.link && step.link.href && step.link.label) {
      var ctaLink = document.createElement("a");
      ctaLink.href = step.link.href;
      ctaLink.className = "btn-paw-outline";
      ctaLink.textContent = step.link.label;
      textCol.appendChild(ctaLink);
    }

    row.appendChild(imgCol);
    row.appendChild(textCol);
    body.appendChild(row);
    panel.appendChild(body);
  }

  /**
   * Updates Previous button, progress label, and Next / Browse Pets slot.
   */
  function renderControls() {
    var prevBtn = document.getElementById("prev-step-btn");
    var progressText = document.getElementById("step-progress-text");
    var nextSlot = document.getElementById("next-step-slot");

    var total = Array.isArray(STEPS) ? STEPS.length : 0;

    if (prevBtn) {
      prevBtn.disabled = currentStep <= 0 || total === 0;
    }

    if (progressText) {
      progressText.textContent = total > 0 ? "Step " + (currentStep + 1) + " of " + total : "";
    }

    if (nextSlot) {
      nextSlot.innerHTML = "";

      if (total > 0 && currentStep === total - 1) {
        // On step 5 (final step), replace Next with a "Browse Pets" link
        var browseLink = document.createElement("a");
        browseLink.href = "../pages/pets.html";
        browseLink.className = "btn-paw";
        browseLink.textContent = "Browse Pets";
        nextSlot.appendChild(browseLink);
      } else {
        var nextBtn = document.createElement("button");
        nextBtn.type = "button";
        nextBtn.className = "btn-paw";
        nextBtn.textContent = "Next";
        nextBtn.disabled = total === 0;
        nextBtn.addEventListener("click", function () {
          goToStep(currentStep + 1, false);
        });
        nextSlot.appendChild(nextBtn);
      }
    }
  }

  /**
   * Re-renders the buttons, content panel, and Previous/Next controls together.
   */
  function renderStepper() {
    renderStepButtons();
    renderStepPanel();
    renderControls();
  }

  document.addEventListener("DOMContentLoaded", function () {
    var prevBtn = document.getElementById("prev-step-btn");
    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        goToStep(currentStep - 1, false);
      });
    }

    renderStepper();
  });
})();
