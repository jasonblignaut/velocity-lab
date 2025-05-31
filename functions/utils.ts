// functions/utils.js

/**
 * Get a cookie from the request headers
 * @param {Request} request - The incoming request
 * @param {string} name - The name of the cookie
 * @returns {string | null} The cookie value or null if not found
 */
export function getCookie(request, name) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
  const cookie = cookies.find(c => c.startsWith(`${name}=`));
  if (!cookie) return null;
  return cookie.split('=')[1];
}

/**
 * Validate a CSRF token
 * @param {Request} request - The incoming request
 * @param {string} token - The expected CSRF token
 * @returns {boolean} True if the token is valid, false otherwise
 */
export function validateCSRFToken(request, token) {
  const submittedToken = request.headers.get('X-CSRF-Token') || '';
  return submittedToken === token;
}