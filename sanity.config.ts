// The EMBEDDED /studio (mounted by @sanity/astro, see astro.config.mjs) loads
// this root config. The single source of truth stays in studio/sanity.config.ts
// so the nested studio package (typegen, schema extract) and the embedded
// studio can never drift apart.
export { default } from './studio/sanity.config';
