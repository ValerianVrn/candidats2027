// @ts-check
import { defineConfig } from 'astro/config';

/**
 * Absolute site URL, used for canonical links, the sitemap and structured data.
 * Set SITE_URL at build time (GitHub environment variable); until the production domain exists it defaults to the
 * dev environment, which is marked noindex anyway.
 */
const site = process.env.SITE_URL || 'https://kind-wave-0e4cc6003.6.azurestaticapps.net';

// https://astro.build/config
// trailingSlash: same rule as the host (staticwebapp.config.json), so URLs have no trailing slash.
export default defineConfig({ site, trailingSlash: 'never' });
