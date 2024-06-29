/**
 * Checks if a string contains only digits or if it's empty.
 *
 * @param {string} str - The string to be checked.
 * @returns {boolean} - Returns true if the string is empty or contains only digits, otherwise returns false.
 */
export const isDigitsOnly = (str) => /^\d*$/.test(str);
