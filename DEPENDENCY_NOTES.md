# Dependency maintenance

The lockfile keeps Vite on the compatible 6.x line and uses patched Rollup 4.59.0
through an npm override. During the 2026-10-03 refresh, Rollup 4.64.0 stalled this
project's production build during transformation; the original lockfile and
Rollup 4.59.0 both completed. Rollup 4.59.0 includes the fix for
[GHSA-mw96-cpmx-2vgc](https://github.com/advisories/GHSA-mw96-cpmx-2vgc).

Do not remove the override solely to select the newest version. Test any future
Rollup update with a clean `npm ci --ignore-scripts`, `npm run build`, and
`npm audit`. This pin should be reevaluated when the build regression is resolved
or a new advisory requires it. No major Vite migration is included here.

The refreshed clean install builds successfully and reports zero npm audit
findings as of the refresh. Existing lint errors and hook warnings are separate
source-code cleanup; a successful build does not imply lint or visual QA passed.
