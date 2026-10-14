/**
 * Application environment configuration
 * Uses Vite environment variables:
 * - VITE_BASE_URL (defaults to http://127.0.0.1:8000)
 * - VITE_API_URL (defaults to http://127.0.0.1:8000/api/v1)
 */

const envBaseUrl: string =
  (import.meta.env && import.meta.env.VITE_BASE_URL) ||
  'http://127.0.0.1:8000';

const envApiUrl: string =
  (import.meta.env && import.meta.env.VITE_API_URL) ||
  `${envBaseUrl}/api/v1`;

// Base backend URL (without trailing slash, e.g. http://127.0.0.1:8000)
export const BASE_URL: string = envBaseUrl.replace(/\/$/, '');

// Base API endpoint URL (without trailing slash, e.g. http://127.0.0.1:8000/api/v1)
export const API_BASE_URL: string = envApiUrl.replace(/\/$/, '');
