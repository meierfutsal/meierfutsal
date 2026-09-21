/** Cloudflare Access JWT verification. Never trusts identity headers. */
export type AccessIdentity = { userId: string; email: string; displayName: string; fullName: string | null };
export type AccessConfig = { teamDomain: string; audience: string };
type AccessKey = JsonWebKey & { kid?: string; alg?: string; use?: string };
const keyCache = new Map<string, { keys: AccessKey[]; fetchedAt: number }>();

export function validAccessConfig(config: AccessConfig): boolean {
  return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.cloudflareaccess\.com$/.test(config.teamDomain)
    && /^[a-f0-9]{64}$/i.test(config.audience);
}
export function accessTokenFromHeaders(headers: Pick<Headers, 'get'>): string | null {
  const assertion = headers.get('cf-access-jwt-assertion');
  if (assertion) return assertion;
  // The cookie authenticates private review photos on the public /media route.
  const cookie = headers.get('cookie') || '';
  return cookie.split(';').map(x => x.trim()).find(x => x.startsWith('CF_Authorization='))?.slice(17) || null;
}
function decodeBase64Url(value: string): Uint8Array<ArrayBuffer> {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('Invalid encoding');
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')), c => c.charCodeAt(0));
}
async function keysFor(team: string, kid: string): Promise<AccessKey[]> {
  const now = Date.now();
  const cached = keyCache.get(team);
  if (cached && (now - cached.fetchedAt < 30_000 ||
      (now - cached.fetchedAt < 300_000 && cached.keys.some(key => key.kid === kid)))) return cached.keys;
  const response = await fetch(`https://${team}/cdn-cgi/access/certs`, {
    redirect: 'error', signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error('Signing keys unavailable');
  const body = await response.text();
  if (body.length > 100_000) throw new Error('Invalid signing keys');
  const data = JSON.parse(body);
  if (!Array.isArray(data.keys) || data.keys.length > 32) throw new Error('Invalid signing keys');
  const keys = data.keys.filter((key: AccessKey) => key && key.kty === 'RSA' &&
    key.alg === 'RS256' && key.use === 'sig' && typeof key.kid === 'string');
  keyCache.set(team, { keys, fetchedAt: now });
  return keys;
}
export async function verifyAccessToken(token: string | null, config: AccessConfig): Promise<AccessIdentity | null> {
  if (!token || token.length > 16_384 || !validAccessConfig(config)) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const header = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[0])));
    const claims = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[1])));
    if (header.alg !== 'RS256' || typeof header.kid !== 'string' || header.crit) return null;
    const now = Math.floor(Date.now() / 1000);
    const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    if (claims.iss !== `https://${config.teamDomain}` || !audiences.includes(config.audience)) return null;
    if (typeof claims.exp !== 'number' || !Number.isFinite(claims.exp) || claims.exp <= now) return null;
    if (typeof claims.iat !== 'number' || !Number.isFinite(claims.iat) || claims.iat > now + 30 || claims.iat >= claims.exp) return null;
    if (claims.nbf !== undefined && (typeof claims.nbf !== 'number' || !Number.isFinite(claims.nbf) || claims.nbf > now + 30)) return null;
    if (typeof claims.sub !== 'string' || !claims.sub || typeof claims.email !== 'string' ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(claims.email)) return null;
    const key = (await keysFor(config.teamDomain, header.kid)).find(candidate => candidate.kid === header.kid);
    if (!key) return null;
    const publicKey = await crypto.subtle.importKey('jwk', key,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const verified = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', publicKey,
      decodeBase64Url(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
    if (!verified) return null;
    const email = claims.email.trim().toLowerCase();
    const fullName = typeof claims.name === 'string' && claims.name.trim() ? claims.name.trim() : null;
    return { userId: claims.sub, email, displayName: fullName || email, fullName };
  } catch {
    // Missing settings, invalid signatures and unavailable keys never grant access.
    return null;
  }
}
