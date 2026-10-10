/**
 * Application environment configuration
 * Automatically switches between development and production via Next.js environment files:
 * - .env / .env.development (for local development)
 * - .env.production (for production builds: `npm run build`)
 */

// Base backend URL (without trailing slash, e.g. http://127.0.0.1:8000)
export const BASE_URL: string = (
  process.env.NEXT_PUBLIC_BASE_URL || 'http://127.0.0.1:8000'
).replace(/\/$/, '');

// Base API endpoint URL (without trailing slash, e.g. http://127.0.0.1:8000/api/v1)
export const API_BASE_URL: string = (
  process.env.NEXT_PUBLIC_API_URL || `${BASE_URL}/api/v1`
).replace(/\/$/, '');
