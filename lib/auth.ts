import { headers } from 'next/headers';
import { env } from 'cloudflare:workers';
import { accessTokenFromHeaders, validAccessConfig, verifyAccessToken } from './access-jwt';
function accessConfig() {
  const settings = env as unknown as { CF_ACCESS_TEAM_DOMAIN?: string; CF_ACCESS_AUD?: string };
  return { teamDomain: (settings.CF_ACCESS_TEAM_DOMAIN || '').trim().toLowerCase(), audience: (settings.CF_ACCESS_AUD || '').trim() };
}
export function isAdminAccessConfigured() { return validAccessConfig(accessConfig()); }
export async function getAdminIdentity() { return verifyAccessToken(accessTokenFromHeaders(await headers()), accessConfig()); }
