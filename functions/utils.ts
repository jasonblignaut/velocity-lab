export async function generateCSRFToken(request: Request): Promise<string> {
  const secretKey = await getCSRFSecretKey();
  const encoder = new TextEncoder();
  const data = encoder.encode(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
  const hmac = await crypto.subtle.sign('HMAC', secretKey, data);
  const hashArray = Array.from(new Uint8Array(hmac));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function validateCSRFToken(request: Request, clientToken: string | null): Promise<boolean> {
  if (!clientToken) {
    return false;
  }
  const serverToken = request.headers.get('X-CSRF-Token');
  return clientToken === serverToken;
}

async function getCSRFSecretKey(): Promise<CryptoKey> {
  const secret = process.env.CSRF_SECRET;
  if (!secret) {
    throw new Error('CSRF_SECRET environment variable not set.');
  }
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
  return keyMaterial;
}