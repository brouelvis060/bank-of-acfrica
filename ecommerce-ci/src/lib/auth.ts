import crypto from 'crypto';

export type SessionPayload = {
  userId: string;
  exp: number; // unix seconds
};

const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export function getAuthSecret(): string {
  return process.env.AUTH_SECRET || 'dev-secret-change-me';
}

export function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16);
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) return reject(err);
      resolve(`${salt.toString('hex')}:${key.toString('hex')}`);
    });
  });
}

export function verifyPassword(password: string, stored: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [saltHex, keyHex] = stored.split(':');
    const salt = Buffer.from(saltHex, 'hex');
    const key = Buffer.from(keyHex, 'hex');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(crypto.timingSafeEqual(key, derivedKey));
    });
  });
}

export function createSession(userId: string, ttlSeconds = DEFAULT_TTL_SECONDS): string {
  const payload: SessionPayload = { userId, exp: Math.floor(Date.now() / 1000) + ttlSeconds };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const hmac = crypto.createHmac('sha256', getAuthSecret()).update(data).digest('base64url');
  return `${data}.${hmac}`;
}

export function verifySession(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [data, mac] = parts;
  const expected = crypto.createHmac('sha256', getAuthSecret()).update(data).digest('base64url');
  const valid = crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected));
  if (!valid) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

