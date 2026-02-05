const SESSION_COOKIE = "admin_session";
const DEFAULT_TTL_SECONDS = 60 * 60 * 24; // 24h

const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let out = "";
  for (const b of bytes) {
    out += b.toString(16).padStart(2, "0");
  }
  return out;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function hmacHex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toHex(signature);
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE;
}

export async function createSessionToken(): Promise<string> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET not configured");
  }

  const now = Math.floor(Date.now() / 1000);
  const ttl = Number(process.env.SESSION_TTL_SECONDS || DEFAULT_TTL_SECONDS);
  const exp = now + Math.max(60, ttl);
  const payload = `${now}.${exp}`;
  const sig = await hmacHex(secret, payload);
  return `${payload}.${sig}`;
}

export async function verifySessionToken(token?: string | null): Promise<boolean> {
  if (!token) return false;
  const secret = process.env.SESSION_SECRET;
  if (!secret) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [issuedStr, expStr, sig] = parts;
  const issued = Number(issuedStr);
  const exp = Number(expStr);
  if (!Number.isFinite(issued) || !Number.isFinite(exp)) return false;

  const now = Math.floor(Date.now() / 1000);
  if (exp < now) return false;

  const payload = `${issuedStr}.${expStr}`;
  const expected = await hmacHex(secret, payload);
  return timingSafeEqual(expected, sig);
}

export function getTokenFromCookieHeader(cookieHeader?: string | null): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((c) => c.trim());
  for (const part of parts) {
    if (part.startsWith(`${SESSION_COOKIE}=`)) {
      return part.substring(`${SESSION_COOKIE}=`.length);
    }
  }
  return null;
}

export async function verifySessionFromRequest(request: Request): Promise<boolean> {
  const token = getTokenFromCookieHeader(request.headers.get("cookie"));
  return verifySessionToken(token);
}
