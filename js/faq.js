/* ==========================================================================
   Paw Home - FAQ Page Script (js/faq.js)
   ==========================================================================
   1. Renders searchable, filterable FAQ accordion items.
   2. Saves and restores helpfulness votes in localStorage under 'ph_faq_votes'
      (an object keyed by FAQ id, using getItem and setItem from storage.js).
   ========================================================================== */

(function () {
  var VOTES_STORAGE_KEY = "ph_faq_votes";

  // List of Islamabad pet adoption FAQs with initial helpfulness counts
  var FAQS = [
    {
      id: "faq-1",
      category: "Adoption Process",
      question: "What documents do I need to adopt a pet in Islamabad?",
      answer:
        "You need a valid original CNIC (for shelter registration) and a completed online adoption application. If you live in a rented house or apartment, shelters also ask for confirmation that your landlord allows pets.",
      baseYes: 18,
      baseNo: 1
    },
    {
      id: "faq-2",
      category: "Adoption Process",
      question: "How long does it take from applying to bringing a pet home?",
      answer:
        "Most adoptions take 3 to 5 days. Partner shelters typically review your application within 24 to 48 hours and then schedule an in-person meet-and-greet before final pickup.",
      baseYes: 14,
      baseNo: 0
    },
    {
      id: "faq-3",
      category: "Fees & Health",
      question: "Why do some pets have an adoption fee while others are free?",
      answer:
        "Adoption fees (between PKR 2,000 and PKR 15,000 depending on species and care needed) help rescue shelters cover vaccinations, deworming, food, and vet checkups. Rescued street dogs or urgent placements are sometimes listed with PKR 0 fee.",
      baseYes: 22,
      baseNo: 2
    },
    {
      id: "faq-4",
      category: "Fees & Health",
      question: "Are all listed pets already vaccinated?",
      answer:
        "Each pet profile clearly displays whether vaccinations are complete. Pets marked as not yet vaccinated (such as young puppies, rabbits, or birds) come with guidance on when their next booster shot is due at an Islamabad vet.",
      baseYes: 16,
      baseNo: 1
    },
    {
      id: "faq-5",
      category: "Home & Care",
      question: "Can I adopt a dog or cat if I live in an apartment in F-10 or E-11?",
      answer:
        "Yes! Many cats, small dogs, rabbits, and birds thrive in apartments. Look for lower-energy profiles or pets noted as apartment-friendly, and make sure balconies and windows are safely meshed for cats.",
      baseYes: 19,
      baseNo: 1
    },
    {
      id: "faq-6",
      category: "Home & Care",
      question: "What should I bring on pickup day?",
      answer:
        "Bring a secure hard-shell carrier for cats, rabbits, or birds, or a sturdy collar and leash for dogs. Also bring your CNIC and a copy of your application confirmation.",
      baseYes: 12,
      baseNo: 0
    },
    {
      id: "faq-7",
      category: "Shelters & Visits",
      question: "Can I visit a shelter in Islamabad before submitting an application?",
      answer:
        "Our partner shelters welcome visitors during posted hours (usually Tuesday to Sunday, 10:00 AM to 6:00 PM). Submitting an application first helps the team prepare the pet's health file for your visit.",
      baseYes: 11,
      baseNo: 1
    },
    {
      id: "faq-8",
      category: "Shelters & Visits",
      question: "I live in Islamabad—can I adopt a pet listed in Rawalpindi or Lahore?",
      answer:
        "Rawalpindi rescues (like Chaklala and TWSPCA) are an easy drive from Islamabad. For Lahore listings, you will need to coordinate travel with the shelter directly, as Paw Home does not ship pets via cargo.",
      baseYes: 15,
      baseNo: 2
    },
    {
      id: "faq-9",
      category: "Home & Care",
      question: "What happens if my existing pet and new pet do not get along?",
      answer:
        "Shelters recommend slow introductions over 1 to 2 weeks. If an adoption truly is not working out for safety or welfare reasons, every partner shelter accepts the pet back so they are never abandoned.",
      baseYes: 20,
      baseNo: 0
    }
  ];

  // Track active filter state and which FAQ ids are expanded
  var activeCategory = "All";
  var searchQuery = "";
  var openIds = { "faq-1": true };

  /**
   * Reads saved votes from localStorage safely using storage.js helper getItem().
   * Returns an object keyed by FAQ id, e.g. { "faq-1": "yes" }.
   */
  function loadVotes() {
    var saved = typeof getItem === "function" ? getItem(VOTES_STORAGE_KEY, {}) : {};
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) {
      return {};
    }
    return saved;
  }

  /**
   * Saves the votes object to localStorage using storage.js helper setItem().
   */
  function saveVotes(votesObj) {
    if (typeof setItem === "function") {
      setItem(VOTES_STORAGE_KEY, votesObj);
    }
  }

  /**
   * Handles clicking Yes or No on a specific FAQ item.
   * Clicking the same vote again removes it; clicking the opposite switches it.
   */
  function handleVote(faqId, choice) {
    var votes = loadVotes();
    if (votes[faqId] === choice) {
      delete votes[faqId];
    } else {
      votes[faqId] = choice;
    }
    saveVotes(votes);
    renderFaqs();
  }

  /**
   * Returns FAQs matching the selected category and search keyword.
   */
  function getFilteredFaqs() {
    var query = searchQuery.trim().toLowerCase();
    return FAQS.filter(function (faq) {
      var matchesCategory = activeCategory === "All" || faq.category === activeCategory;
      var matchesSearch =
        query === "" ||
        faq.question.toLowerCase().indexOf(query) !== -1 ||
        faq.answer.toLowerCase().indexOf(query) !== -1 ||
        faq.category.toLowerCase().indexOf(query) !== -1;
      return matchesCategory && matchesSearch;
    });
  }

  /**
   * Renders the FAQ accordion list and updates the result count.
   */
  function renderFaqs() {
    var container = document.getElementById("faq-list");
    var emptyState = document.getElementById("faq-empty-state");
    var countEl = document.getElementById("faq-results-count");
    if (!container) {
      return;
    }

    var filtered = getFilteredFaqs();
    var votes = loadVotes();

    if (countEl) {
      countEl.textContent =
        "Showing " + filtered.length + " of " + FAQS.length + " questions";
    }

    container.innerHTML = "";

    if (filtered.length === 0) {
      if (emptyState) emptyState.hidden = false;
      return;
    }

    if (emptyState) emptyState.hidden = true;

    filtered.forEach(function (faq) {
      var isOpen = Boolean(openIds[faq.id]);
      var userVote = votes[faq.id] || null;
      var yesCount = faq.baseYes + (userVote === "yes" ? 1 : 0);
      var noCount = faq.baseNo + (userVote === "no" ? 1 : 0);

      var article = document.createElement("article");
      article.className = "faq-item" + (isOpen ? " is-open" : "");

      // Question toggle button
      var btnId = "faq-btn-" + faq.id;
      var panelId = "faq-panel-" + faq.id;

      var button = document.createElement("button");
      button.type = "button";
      button.id = btnId;
      button.className = "faq-question-btn";
      button.setAttribute("aria-expanded", isOpen ? "true" : "false");
      button.setAttribute("aria-controls", panelId);

      var titleWrap = document.createElement("div");
      var badge = document.createElement("span");
      badge.className = "paw-badge paw-badge-orange me-2";
      badge.textContent = faq.category;

      var qTitle = document.createElement("span");
      qTitle.className = "faq-question-title";
      qTitle.textContent = faq.question;

      titleWrap.appendChild(badge);
      titleWrap.appendChild(qTitle);

      var icon = document.createElement("span");
      icon.className = "faq-toggle-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = isOpen ? "\u2212" : "+";

      button.appendChild(titleWrap);
      button.appendChild(icon);

      button.addEventListener("click", function () {
        openIds[faq.id] = !openIds[faq.id];
        renderFaqs();
      });

      // Answer panel
      var panel = document.createElement("div");
      panel.id = panelId;
      panel.className = "faq-answer-panel";
      panel.setAttribute("role", "region");
      panel.setAttribute("aria-labelledby", btnId);
      panel.hidden = !isOpen;

      var answerP = document.createElement("p");
      answerP.className = "faq-answer-text";
      answerP.textContent = faq.answer;

      // Helpful voting bar
      var voteBar = document.createElement("div");
      voteBar.className = "faq-vote-bar";

      var voteLabel = document.createElement("span");
      voteLabel.className = "faq-vote-label";
      voteLabel.textContent = userVote
        ? "Thanks for your feedback! (Saved)"
        : "Was this answer helpful?";

      var voteActions = document.createElement("div");
      voteActions.className = "faq-vote-actions";

      var yesBtn = document.createElement("button");
      yesBtn.type = "button";
      yesBtn.className = "faq-vote-btn" + (userVote === "yes" ? " is-voted-yes" : "");
      yesBtn.setAttribute("aria-pressed", userVote === "yes" ? "true" : "false");
      yesBtn.textContent = "Yes (" + yesCount + ")";
      yesBtn.addEventListener("click", function () {
        handleVote(faq.id, "yes");
      });

      var noBtn = document.createElement("button");
      noBtn.type = "button";
      noBtn.className = "faq-vote-btn" + (userVote === "no" ? " is-voted-no" : "");
      noBtn.setAttribute("aria-pressed", userVote === "no" ? "true" : "false");
      noBtn.textContent = "No (" + noCount + ")";
      noBtn.addEventListener("click", function () {
        handleVote(faq.id, "no");
      });

      voteActions.appendChild(yesBtn);
      voteActions.appendChild(noBtn);
      voteBar.appendChild(voteLabel);
      voteBar.appendChild(voteActions);

      panel.appendChild(answerP);
      panel.appendChild(voteBar);

      article.appendChild(button);
      article.appendChild(panel);
      container.appendChild(article);
    });
  }

  /**
   * Wires search input, category pills, Expand/Collapse All, and Reset button.
   */
  function initControls() {
    var searchInput = document.getElementById("faq-search");
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        searchQuery = searchInput.value;
        renderFaqs();
      });
    }

    var catButtons = document.querySelectorAll(".faq-cat-btn");
    catButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeCategory = btn.getAttribute("data-category") || "All";
        catButtons.forEach(function (otherBtn) {
          var isSelected = otherBtn === btn;
          otherBtn.setAttribute("aria-pressed", isSelected ? "true" : "false");
          otherBtn.classList.toggle("btn-paw", isSelected);
          otherBtn.classList.toggle("btn-paw-outline", !isSelected);
        });
        renderFaqs();
      });
    });

    var expandAllBtn = document.getElementById("faq-expand-all");
    if (expandAllBtn) {
      expandAllBtn.addEventListener("click", function () {
        getFilteredFaqs().forEach(function (faq) {
          openIds[faq.id] = true;
        });
        renderFaqs();
      });
    }

    var collapseAllBtn = document.getElementById("faq-collapse-all");
    if (collapseAllBtn) {
      collapseAllBtn.addEventListener("click", function () {
        openIds = {};
        renderFaqs();
      });
    }

    var clearBtn = document.getElementById("faq-clear-filters");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        searchQuery = "";
        activeCategory = "All";
        if (searchInput) searchInput.value = "";
        catButtons.forEach(function (btn) {
          var isAll = btn.getAttribute("data-category") === "All";
          btn.setAttribute("aria-pressed", isAll ? "true" : "false");
          btn.classList.toggle("btn-paw", isAll);
          btn.classList.toggle("btn-paw-outline", !isAll);
        });
        renderFaqs();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initControls();
    renderFaqs();
  });
})();
