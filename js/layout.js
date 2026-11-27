/* ==========================================================================
   Paw Home - Shared Header & Footer Injector
   ==========================================================================
   Injects the sticky cream navbar into #site-header and the 3-column footer
   into #site-footer on every page. Automatically resolves relative paths for
   both root (index.html) and subpages (pages/*.html), highlights the current
   page, renders the favourites count badge, and handles ph_user login state.
   ========================================================================== */

(function () {
  /**
   * Computes relative path prefix based on whether the current page lives in /pages/.
   * @returns {string} '../' for pages/* or '' for root pages.
   */
  function getBasePrefix() {
    var path = window.location.pathname.replace(/\\/g, "/");
    return /\/pages\//i.test(path) ? "../" : "";
  }

  /**
   * Returns normalized filename of the current page (e.g. 'index.html' or 'pets.html').
   * @returns {string}
   */
  function getCurrentFileName() {
    var path = window.location.pathname.replace(/\\/g, "/");
    var file = path.split("/").pop();
    return file ? file.toLowerCase() : "index.html";
  }

  /**
   * Safely reads storage even if storage.js was not included.
   */
  function safeGet(key, fallback) {
    if (typeof getItem === "function") {
      return getItem(key, fallback);
    }
    try {
      var raw = window.localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (err) {
      return fallback;
    }
  }

  /**
   * Safely removes a key from storage even if storage.js was not included.
   */
  function safeRemove(key) {
    if (typeof removeItem === "function") {
      return removeItem(key);
    }
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Returns the number of saved pet IDs in localStorage key 'ph_favourites'.
   * @returns {number}
   */
  function getFavouritesCount() {
    var favs = safeGet("ph_favourites", []);
    return Array.isArray(favs) ? favs.length : 0;
  }

  /**
   * Updates the favourites badge count in the navbar without re-rendering everything.
   */
  function updateFavouritesBadge() {
    var badge = document.getElementById("nav-fav-count");
    if (badge) {
      badge.textContent = String(getFavouritesCount());
    }
  }

  /**
   * Replaces a missing/broken image with a neutral gray SVG placeholder so no
   * broken-image icon appears. Use via:
   *   onerror="this.onerror=null; pawLayout.handleImageError(this);"
   * @param {HTMLImageElement} img
   */
  function handleImageError(img) {
    if (!img) {
      return;
    }
    img.onerror = null;
    img.classList.add("paw-img-missing");
    img.src =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23EEEEEE'/%3E%3C/svg%3E";
  }

  /**
   * Inline SVG for the white paw print inside the orange circle brand logo.
   */
  var PAW_LOGO_SVG =
    '<svg width="22" height="22" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<ellipse cx="32" cy="41" rx="14" ry="12" fill="#FFFFFF"/>' +
    '<circle cx="15" cy="25" r="5.5" fill="#FFFFFF"/>' +
    '<circle cx="26" cy="16" r="5.5" fill="#FFFFFF"/>' +
    '<circle cx="38" cy="16" r="5.5" fill="#FFFFFF"/>' +
    '<circle cx="49" cy="25" r="5.5" fill="#FFFFFF"/>' +
    "</svg>";

  /**
   * Builds and injects the sticky navbar header into #site-header.
   */
  function renderHeader() {
    var container = document.getElementById("site-header");
    if (!container) {
      return;
    }

    var prefix = getBasePrefix();
    var currentFile = getCurrentFileName();
    var inPagesDir = prefix === "../";

    var primaryLinks = [
      { label: "Home", href: "index.html", file: "index.html", rootOnly: true },
      { label: "Browse Pets", href: "pages/pets.html", file: "pets.html" },
      { label: "Adopt", href: "pages/adopt.html", file: "adopt.html" },
      { label: "Favourites", href: "pages/favourites.html", file: "favourites.html", isFav: true },
      { label: "Care Guides", href: "pages/care-guides.html", file: "care-guides.html" },
      { label: "Shelters", href: "pages/shelters.html", file: "shelters.html" },
      { label: "Events", href: "pages/events.html", file: "events.html" }
    ];

    var moreLinks = [
      { label: "About", href: "pages/about.html", file: "about.html" },
      { label: "How It Works", href: "pages/how-it-works.html", file: "how-it-works.html" },
      { label: "FAQ", href: "pages/faq.html", file: "faq.html" },
      { label: "Success Stories", href: "pages/success-stories.html", file: "success-stories.html" },
      { label: "Volunteer", href: "pages/volunteer.html", file: "volunteer.html" },
      { label: "Donate", href: "pages/donate.html", file: "donate.html" },
      { label: "Contact", href: "pages/contact.html", file: "contact.html" }
    ];

    function isItemActive(item) {
      if (item.rootOnly) {
        return !inPagesDir && currentFile === "index.html";
      }
      return inPagesDir && currentFile === item.file;
    }

    var moreIsActive = moreLinks.some(isItemActive);
    var loginIsActive = inPagesDir && currentFile === "login.html";
    var favCount = getFavouritesCount();

    var primaryNavHtml = primaryLinks
      .map(function (item) {
        var active = isItemActive(item);
        var cls = "nav-link paw-nav-link" + (active ? " paw-nav-active active" : "");
        var aria = active ? ' aria-current="page"' : "";
        var badge = item.isFav
          ? ' <span class="paw-fav-badge" id="nav-fav-count" aria-label="saved pets">' +
            favCount +
            "</span>"
          : "";
        return (
          '<li class="nav-item">' +
          '<a class="' +
          cls +
          '" href="' +
          prefix +
          item.href +
          '"' +
          aria +
          ">" +
          item.label +
          badge +
          "</a>" +
          "</li>"
        );
      })
      .join("");

    var moreDropdownHtml =
      '<li class="nav-item dropdown">' +
      '<a class="nav-link dropdown-toggle paw-nav-link' +
      (moreIsActive ? " paw-nav-active active" : "") +
      '" href="#" id="pawMoreDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">' +
      "More" +
      "</a>" +
      '<ul class="dropdown-menu paw-dropdown-menu" aria-labelledby="pawMoreDropdown">' +
      moreLinks
        .map(function (item) {
          var active = isItemActive(item);
          var cls = "dropdown-item paw-dropdown-item" + (active ? " paw-nav-active active" : "");
          var aria = active ? ' aria-current="page"' : "";
          return (
            "<li>" +
            '<a class="' +
            cls +
            '" href="' +
            prefix +
            item.href +
            '"' +
            aria +
            ">" +
            item.label +
            "</a>" +
            "</li>"
          );
        })
        .join("") +
      "</ul>" +
      "</li>";

    container.innerHTML =
      '<header class="sticky-top">' +
      '<nav class="navbar navbar-expand-lg paw-navbar" aria-label="Main navigation">' +
      '<div class="container">' +
      '<a class="navbar-brand paw-brand" href="' +
      prefix +
      'index.html">' +
      '<span class="paw-logo-circle">' +
      PAW_LOGO_SVG +
      "</span>" +
      '<span class="paw-brand-text">Paw Home</span>' +
      "</a>" +
      '<button class="navbar-toggler paw-toggler" type="button" data-bs-toggle="collapse" ' +
      'data-bs-target="#pawNavbarContent" aria-controls="pawNavbarContent" aria-expanded="false" ' +
      'aria-label="Toggle navigation">' +
      '<span class="navbar-toggler-icon"></span>' +
      "</button>" +
      '<div class="collapse navbar-collapse" id="pawNavbarContent">' +
      '<ul class="navbar-nav me-auto mb-2 mb-lg-0 align-items-lg-center gap-lg-1">' +
      primaryNavHtml +
      moreDropdownHtml +
      "</ul>" +
      '<div class="d-flex align-items-center gap-2 pt-2 pt-lg-0" id="nav-auth-slot"></div>' +
      "</div>" +
      "</div>" +
      "</nav>" +
      "</header>";

    // Render user auth state safely with textContent so user-supplied names cannot inject HTML
    var authSlot = document.getElementById("nav-auth-slot");
    if (authSlot) {
      var user = safeGet("ph_user", null);
      if (user && typeof user.name === "string" && user.name.trim() !== "") {
        var greeting = document.createElement("span");
        greeting.className = "paw-user-greeting";
        greeting.textContent = "Hi, " + user.name.trim();

        var logoutLink = document.createElement("a");
        logoutLink.href = "#logout";
        logoutLink.className = "paw-logout-link";
        logoutLink.textContent = "Logout";
        logoutLink.addEventListener("click", function (event) {
          event.preventDefault();
          safeRemove("ph_user");
          renderHeader();
        });

        authSlot.appendChild(greeting);
        authSlot.appendChild(logoutLink);
      } else {
        var loginLink = document.createElement("a");
        loginLink.href = prefix + "pages/login.html";
        loginLink.className = "nav-link paw-nav-link" + (loginIsActive ? " paw-nav-active active" : "");
        if (loginIsActive) {
          loginLink.setAttribute("aria-current", "page");
        }
        loginLink.textContent = "Login";
        authSlot.appendChild(loginLink);
      }
    }
  }

  /**
   * Builds and injects the 3-column footer into #site-footer.
   */
  function renderFooter() {
    var container = document.getElementById("site-footer");
    if (!container) {
      return;
    }

    var prefix = getBasePrefix();

    container.innerHTML =
      '<footer class="paw-footer">' +
      '<div class="container">' +
      '<div class="row g-4">' +
      '<div class="col-12 col-md-4">' +
      '<h2 class="paw-footer-heading">Quick Links</h2>' +
      '<ul class="paw-footer-links">' +
      '<li><a class="paw-footer-link" href="' + prefix + 'index.html">Home</a></li>' +
      '<li><a class="paw-footer-link" href="' + prefix + 'pages/pets.html">Browse Pets</a></li>' +
      '<li><a class="paw-footer-link" href="' + prefix + 'pages/adopt.html">Adopt a Pet</a></li>' +
      '<li><a class="paw-footer-link" href="' + prefix + 'pages/shelters.html">Islamabad Shelters</a></li>' +
      '<li><a class="paw-footer-link" href="' + prefix + 'pages/care-guides.html">Care Guides</a></li>' +
      '<li><a class="paw-footer-link" href="' + prefix + 'pages/faq.html">FAQ</a></li>' +
      "</ul>" +
      "</div>" +
      '<div class="col-12 col-md-4">' +
      '<h2 class="paw-footer-heading">Contact Islamabad</h2>' +
      '<ul class="paw-footer-links">' +
      "<li>House 14, Street 8, Sector F-7/2, Islamabad</li>" +
      '<li>Phone: <a class="paw-footer-link" href="tel:+9251111729466">+92 51 111-729-466</a></li>' +
      '<li>Email: <a class="paw-footer-link" href="mailto:hello@pawhome.pk">hello@pawhome.pk</a></li>' +
      "<li>Hours: Tue - Sun, 10:00 AM - 6:00 PM</li>" +
      "</ul>" +
      "</div>" +
      '<div class="col-12 col-md-4">' +
      '<h2 class="paw-footer-heading">Follow Us</h2>' +
      '<ul class="paw-footer-links">' +
      '<li><a class="paw-footer-link" href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a></li>' +
      '<li><a class="paw-footer-link" href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a></li>' +
      '<li><a class="paw-footer-link" href="https://x.com" target="_blank" rel="noopener noreferrer">X (Twitter)</a></li>' +
      '<li><a class="paw-footer-link" href="' + prefix + 'pages/contact.html">Send Us a Message</a></li>' +
      "</ul>" +
      "</div>" +
      "</div>" +
      '<div class="paw-footer-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">' +
      '<p class="mb-0">(c) 2026 Paw Home</p>' +
      '<p id="ai-disclosure" class="mb-0"></p>' +
      "</div>" +
      "</div>" +
      "</footer>";
  }

  /**
   * Initializes header and footer once DOM is ready.
   */
  function initLayout() {
    renderHeader();
    renderFooter();
  }

  // Expose helpers for page scripts (e.g., updating favourites badge or image fallbacks)
  window.pawLayout = {
    renderHeader: renderHeader,
    renderFooter: renderFooter,
    updateFavouritesBadge: updateFavouritesBadge,
    handleImageError: handleImageError
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLayout);
  } else {
    initLayout();
  }
})();
