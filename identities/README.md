# Identity inputs

Approved outlined SVG artwork and social-avatar PNG exports for Gaming, Captures, Tech, Miniatures, and Design. `asset-manifest.json` records the original colors and asset paths. These are self-contained assets with no linked font or image dependencies.

The design system generates web variants from these masters using `design-system/scripts/build-tokens.mjs`:

- Original ink colors remain unchanged in dark mode.
- Tech and Miniatures use their brand 600 shade in light mode.
- Design uses shared neutral 900 in light mode.
- Full web logos share a common canvas to keep the mark and first wordmark row aligned.

Generated files live under `design-system/src/assets/`. The master SVGs retain their original colors and canvas sizes. Historical Design filenames ending in `-dark.svg` mean black ink, not dark mode; the website uses its generated theme variants instead.

Lettering is outlined from Inter; the underlying font is licensed under the SIL Open Font License. Font files are not bundled here. Identity exploration and the original asset-production tools are maintained separately from this repository.
