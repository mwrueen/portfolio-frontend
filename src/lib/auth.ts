export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  const localToken = localStorage.getItem('admin_token');
  if (localToken) return localToken;

  // Fallback to cookie
  const match = document.cookie.match(new RegExp('(^| )admin_token=([^;]+)'));
  if (match) {
    const cookieToken = decodeURIComponent(match[2]);
    localStorage.setItem('admin_token', cookieToken);
    return cookieToken;
  }
  return null;
}

export function setAdminAuth(token: string, user?: any): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('admin_token', token);
  if (user) {
    localStorage.setItem('admin_user', JSON.stringify(user));
  }
  document.cookie = `admin_token=${encodeURIComponent(token)}; path=/; max-age=2592000; SameSite=Lax`;
}

export function clearAdminAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
  document.cookie = 'admin_token=; path=/; max-age=0; SameSite=Lax';
}
