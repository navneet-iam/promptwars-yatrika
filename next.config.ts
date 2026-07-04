import type { NextConfig } from "next";

// Security headers applied to every response. The CSP intentionally allows
// 'unsafe-inline' for scripts/styles because Next.js injects inline hydration
// scripts and next/font injects an inline @font-face style block; a nonce-based
// policy would break those without a custom server. All third-party calls
// (Gemini, Wikipedia) happen server-side, so `connect-src 'self'` is sufficient
// for the browser.
//
// 'unsafe-eval' is added ONLY in development, where React relies on eval() for
// debugging features (e.g. reconstructing callstacks). It is never emitted in
// production, keeping the deployed policy strict.
const isDev = process.env.NODE_ENV !== 'production';
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  : "script-src 'self' 'unsafe-inline'";

const contentSecurityPolicy = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
