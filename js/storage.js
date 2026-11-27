/* ==========================================================================
   Paw Home - Safe localStorage Helpers
   ==========================================================================
   Provides global getItem, setItem, and removeItem functions that wrap
   window.localStorage with JSON serialization and try/catch guards so
   corrupted data or restricted browser storage never breaks the site.
   ========================================================================== */

/**
 * Reads and parses a JSON value from localStorage.
 * @param {string} key - The localStorage key to read.
 * @param {*} [fallback=null] - Value returned if key is missing, invalid, or blocked.
 * @returns {*} Parsed value or fallback.
 */
function getItem(key, fallback) {
  var defaultValue = arguments.length > 1 ? fallback : null;
  try {
    var raw = window.localStorage.getItem(key);
    if (raw === null) {
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch (err) {
    return defaultValue;
  }
}

/**
 * Serializes a value as JSON and writes it to localStorage.
 * @param {string} key - The localStorage key to write.
 * @param {*} value - Any JSON-serializable value.
 * @returns {boolean} True if saved successfully, false otherwise.
 */
function setItem(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Removes a key from localStorage safely.
 * @param {string} key - The localStorage key to delete.
 * @returns {boolean} True if removed without error, false otherwise.
 */
function removeItem(key) {
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (err) {
    return false;
  }
}
