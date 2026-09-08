// Günlük şifrelemesi (PLAN.md Aşama 17, madde 3). Tamamen tarayıcı
// tarafında (Web Crypto API) çalışır — günlük parolası ve türetilen
// anahtar hiçbir zaman sunucuya gönderilmez, sadece kilit açıkken
// bellekte (bir CryptoKey nesnesi olarak) tutulur. Kilitlenince veya
// sayfadan çıkılınca bu anahtar atılır (AppState.tsx).
const PBKDF2_ITERATIONS = 250_000;
const CANARY_TEXT = 'gunluk-dogrulama-ok';

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function randomSalt(): string {
  return bytesToBase64(crypto.getRandomValues(new Uint8Array(16)));
}

export async function deriveDiaryKey(password: string, saltB64: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const salt = base64ToBytes(saltB64);
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptText(key: CryptoKey, plaintext: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plaintext));
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return bytesToBase64(combined);
}

// Yanlış anahtarla çözmeye çalışırsa AES-GCM'in kimlik doğrulama etiketi
// uyuşmaz ve crypto.subtle.decrypt reddedilir (throw) — bunu yakalayıp
// null döndürüyoruz, "yanlış parola" olarak yorumlanıyor.
export async function decryptText(key: CryptoKey, blob: string): Promise<string | null> {
  try {
    const combined = base64ToBytes(blob);
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const dec = new TextDecoder();
    const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
    return dec.decode(plainBuf);
  } catch {
    return null;
  }
}

export async function makeCanary(key: CryptoKey): Promise<string> {
  return encryptText(key, CANARY_TEXT);
}

export async function verifyCanary(key: CryptoKey, canary: string): Promise<boolean> {
  const decrypted = await decryptText(key, canary);
  return decrypted === CANARY_TEXT;
}
