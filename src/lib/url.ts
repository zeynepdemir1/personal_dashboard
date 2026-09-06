export function ensureProtocol(url: string): string {
  if (!url) return url;
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(url) ? url : `https://${url}`;
}

export function deriveTitleFromUrl(url: string): string {
  try {
    const u = new URL(ensureProtocol(url));
    const host = u.hostname.replace(/^www\./, '');
    const path = u.pathname !== '/' ? u.pathname : '';
    return host + path;
  } catch {
    return url;
  }
}
