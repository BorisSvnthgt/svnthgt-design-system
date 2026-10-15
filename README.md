# Svnthgt design system

Design tokens, five identity themes, and an interactive component reference for Svnthgt. Built with Astryx by Meta, React, Phosphor icons, Sora, and Inter.

## Run locally

Requires Node.js 22.12 or newer.

```sh
cd design-system
npm ci
npm run dev -- --port 5178
```

Open http://127.0.0.1:5178. The showcase includes Gaming, Captures, Tech, Miniatures, and Design, each with light, dark, and system modes.

```sh
npm run tokens  # Generate theme tokens and web logo variants
npm run check   # Validate contrast, identity geometry, spacing, and TypeScript
npm run build   # Generate, validate, and create a production build
```

## Contents

- [Design-system documentation](design-system/README.md): decisions, component integration, and token architecture.
- `design-system/tokens/`: authored foundations and generated CSS/JSON.
- `design-system/src/`: interactive reference and Astryx theme integration.
- `design-system/scripts/`: deterministic token generation and validation.
- [Identity assets](identities/README.md): approved master artwork used by the generator.

Keep `design-system/` and `identities/` together: the token generator reads the identity manifest and master SVGs from the sibling folder. Dependencies, build output, local screenshots, and exploration files are excluded from version control.

This private repository contains proprietary Svnthgt artwork and project code; no open-source license is granted for them. Third-party packages and fonts retain their own licenses.
