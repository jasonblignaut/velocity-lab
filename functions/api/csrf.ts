// functions/utils.js

// Get a cookie from the request headers
export function getCookie(request, name) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
  const cookie = cookies.find(c => c.startsWith(`${name}=`));
  if (!cookie) return null;
  return cookie.split('=')[1];
}

// Generate a CSRF token
export function generateCSRFToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Validate a CSRF token
export function validateCSRFToken(request, token) {
  const submittedToken = request.headers.get('X-CSRF-Token') || '';
  return submittedToken === token;
}