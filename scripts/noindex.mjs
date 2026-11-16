// Marks a build as non-indexable (used for the dev environment):
// adds an X-Robots-Tag header to staticwebapp.config.json and replaces robots.txt.
// Usage: node scripts/noindex.mjs dist
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2] ?? 'dist';
const configPath = join(dir, 'staticwebapp.config.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));
config.globalHeaders = { ...config.globalHeaders, 'X-Robots-Tag': 'noindex, nofollow' };
writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
writeFileSync(join(dir, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
console.log(`noindex applied to ${dir}`);
