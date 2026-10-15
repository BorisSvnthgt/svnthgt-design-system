# Svnthgt design system

Version 0.2 · 15 October 2026 · Foundation for the future website.

This project contains reusable tokens, five working Astryx themes, a complete Phosphor semantic icon registry, and an interactive component reference. It is a design-system workspace, not the final website. Start with the local showcase to review decisions.

## Run

```powershell
cd 'G:\Codex Projects\Personal Brand - Svnthgt\design-system'
npm ci
npm run dev -- --port 5178
```

Open http://127.0.0.1:5178. Switch identity and light/dark/system mode at the top. The preview remembers those choices locally. The preview server must be running; it is not a public deployment.

```text
npm run tokens    Regenerate CSS and JSON from the committed sources
npm run check     Check contrast, spacing, brand seeds, and TypeScript
npm run build     Regenerate, check, and build the showcase
```

## Decisions and provenance

| Area | Decision | Status |
| --- | --- | --- |
| Component foundation | Astryx by Meta, pinned to 0.7.1; React 19 | Requested foundation, verified and installed |
| Icons | Phosphor React 2.1.10; Regular at 20px, with 16/24/32px options | Library requested; weight and sizes proposed |
| Spacing | 0, 2, 4, 8, 12, 16, 20, 24, 28…128px | Requested progression; zero means no spacing |
| Colors | Exact seeds from `../identities/asset-manifest.json` | Existing approved brand artwork |
| Shade generation | Fixed 50–950 brand scales, exact logo color at 500; Astryx OKLCH for status colors | Vivid brand anchor requested; tint/shade proportions proposed |
| Mode | Light, dark, and system; same semantic roles, different values | Requested |
| Button corners | Action and icon buttons: 8px; top navigation: rounded | User-selected distinction, separate action/navigation tokens |
| Other radii | 4px details, 12px fields, 20px cards, 28px large containers | Proposed |
| Website fonts | Sora Bold 700 headings; Inter Regular 400 and Bold 700 body/UI | User-selected pairing, with Inter as the requested Graphie fallback |
| Logo font | Inter Black, separate from website typography | Earlier chat and local asset documentation |
| Type sizes | H1–H5: 72, 48, 32, 24, 20px. Paragraphs: 24, 16, 14, 12px, regular/bold | User's reference; even line heights added |
| Neutrals | One achromatic 13-stop ramp, white through black | Inspired by the user's earlier palette; shared across every identity |
| Logo presentation | Upright; transparent surroundings on mode-appropriate surfaces | Explicit user requirement; never angle the logo |

The user selected Sora for headings and Graphie for the rest only if Graphie were a Google Font, otherwise Inter. Graphie is published by Dharma Type and distributed through Adobe Fonts; Inter is the chosen fallback. Both Sora and Inter are on Google Fonts and are served locally through pinned `@fontsource-variable` packages (no runtime requests to Google). Heading weight 700 and paragraph weights 400/700 follow the supplied typography image. Inter Black in the outlined logo masters remains separate from website text.

**Logo rules:** Never rotate, skew, or angle any logo. Dark mode retains every exact original artwork color. In light mode, Tech uses brand 600 (`#00d100`) and Miniatures uses brand 600 (`#d1d100`) for clearer logo visibility. Gaming and Captures keep their originals. All logos sit directly on the theme surface. Design uses neutral 900 (`#202020`) on light and soft white (`#F9F9F9`) on dark. Every web SVG variant is generated from the original geometry into `src/assets/`. All full-logo variants share the widest master canvas (127.31 × 34.93 units), preserving a fixed mark, wordmark position, and rendered scale when identities change. Only the identity-specific dot, second row, and intended ink vary. Surface selection must come from the active theme, never filename selectors: Vite may inline an SVG as a data URI or rename it during build. No forced black tiles in light mode.

## Source of truth

```text
../identities/asset-manifest.json  Approved identity colors and logo paths
tokens/foundations.json           Font decision, space, type, shape, size, layout, motion
tokens/neutral.json               Shared fixed gray ramp and light/dark semantic assignments
tokens/brand-scale.json           Fixed brand 500 anchor and shared tint/shade proportions
tokens/identity.json              Light-mode logo shade selection; dark originals preserved
tokens/palette.config.json        Status-color inputs to Astryx's OKLCH generator
tokens/palette.json               Generated status-color light/dark ramps
tokens/palette.receipt.json       Reproducibility receipt from Astryx
scripts/build-tokens.mjs          Brand scales, aligned web logo variants, semantic mapping and exporter
src/assets/*.svg                  Generated aligned logo variants for every identity/mode
tokens/resolved.json              Generated complete token manifest and theme inputs
tokens/tokens.css                 Generated CSS custom properties
src/themes.ts                    Astryx theme definitions and component overrides
src/icons.tsx                    Complete 30-name Phosphor registry
src/components.css               Shared state and reduced-motion policies
src/fonts.css                    Local Sora and Inter font-face imports
src/system.css                   Showcase layout only; do not import into the website
tokens/astryx-components.txt      Snapshot of the installed component catalog
```

Do not edit generated `resolved.json`, `tokens.css`, or the web SVG variants. Change the source and run `npm run tokens`. Brand scales derive directly from the identity manifest; no duplicate seed configuration is needed. Edit `tokens/brand-scale.json` to adjust tint/shade proportions.

Regenerate status palettes explicitly after reviewing their seed configuration:

```text
npm run astryx -- theme palette generate tokens/palette.config.json --out tokens/palette.json --overwrite
npm run tokens
npm run check
```

## Color architecture

1. **Identity:** Gaming `#BF24FF`, Captures `#FF0000`, Tech `#00FF00`, Miniatures `#FFFF00`, Design `#F9F9F9` (neutral 900 web artwork on light backgrounds). Original source assets remain unchanged; explicit themed variants preserve their geometry.
2. **Palette:** Fixed 50–950 primitives for each colored brand, with its exact source color at **500**. Stops 50–400 mix the seed with white; 600–950 mix it with black in sRGB, preserving hue and saturation in the shades. This deliberately keeps Tech green and Miniatures yellow vivid. These are brand-relative scales, not equal perceived lightness across hues. `--sg-brand-500` and `--sg-brand-original` are identical for the four colored identities. The swatch marker says “Logo” and follows the active logo ink: Tech/Miniatures 600 in light mode and 500 in dark mode. The source brand anchor remains 500. Design marks neutral 900 in light mode; its custom soft-white dark ink is listed separately because it is not an exact neutral stop. Design uses the shared neutral scale instead. An internal 21-stop ascending tone adapter feeds semantic selection; intermediate values interpolate the fixed primitives. Astryx generates the separate status-color ramps.
3. **Semantic roles:** body, surface, raised surface, muted surface, primary/secondary text, decorative border, control border, accent, hover, pressed, and subtle fill. Components consume roles rather than raw colors.
4. **Component state:** Astryx tokens and public component overrides supply the final rendered values. Primary action hover and press colors use explicit tested values rather than composited overlays. The 8px action radius is independent of the navigation radius. TextInput uses Astryx’s own focus-within border and inset ring: no component border override and no global outline on the inner input. Page focus styling is scoped to the handmade showcase navigation and copy controls.

Mode changes reverse the *role assignment*, not the artwork or the hue. Light mode selects darker accent shades; dark mode starts with the vivid 500 anchor and lightens only where the contrast checks require it. `--sg-logo-color` exposes the active logo ink independently of the UI accent. CSS `light-dark()` and Astryx's `Theme` provider implement this. Design is achromatic. Brand and mode are independent axes: all five identities have both modes.

Sidebar selection uses a dedicated role: brand/neutral 200 in light mode, without an accent edge; dark selection retains its earlier fill and text colors. It does not change the shared muted role used by fields or other components.

The shared neutral scale is white, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, black. The primitive values are identical across brands and modes. Light canvas uses 50, dark canvas uses 950; cards use white/900, primary text uses 950/50, and secondary text uses 600/400. `tokens/neutral.json` defines every assignment. The reference uses the earlier palette's neutral character while refining middle tones and contrast, rather than copying its full color system. Orange has not been introduced as an additional identity.

Status colors are separate families for success, warning, error, and information. A Captures accent must not automatically imply an error; a Tech accent must not automatically imply success. Pair status colors with meaningful text and icons.

Decorative separators can be subtle. Necessary control boundaries use `--color-border-emphasized`, validated at 3:1 or higher. Normal text and primary button labels use 4.5:1 or higher. These checks cover defined token pairs, not blanket certification of the entire upstream component library.

## Using Astryx in the future website

The dependency is installed directly from npm, with an exact version and lockfile. The CLI reads the installed version's APIs and theming targets; there is no external account or MCP connection required.

```tsx
import {Theme} from '@astryxdesign/core/theme';
import {Button} from '@astryxdesign/core/Button';
import {themes} from './design-system/src/themes';
import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import './design-system/tokens/tokens.css';
import './design-system/src/components.css';
import './design-system/src/fonts.css';

export function Page() {
  return (
    <Theme theme={themes.gaming} mode="system">
      <Button label="Explore work" variant="primary" />
    </Theme>
  );
}
```

Adapt the relative imports to the website's location. Set the website body's font to `var(--font-family-body)`, background to `var(--color-background-body)`, and text to `var(--color-text-primary)`. The showcase supplies those base styles in its own stylesheet.

The current theme definitions use Astryx's supported runtime `defineTheme` path, appropriate for this local client-rendered reference. For a server-rendered website, compile the themes with `astryx theme build` and use the resulting CSS and theme modules to avoid a first-paint flash. Read `npm run astryx -- docs author-a-theme` for the icon sidecar and theme-family build rules. The future website framework remains open.

To use tokens without React, import `tokens.css`, set `data-astryx-theme="svnthgt-gaming"`, and set `data-theme="light"` or `"dark"`; omit `data-theme` for system mode. This supplies variables only, not Astryx component behavior.

## Component reference and coverage

| Website need | Astryx source | This foundation |
| --- | --- | --- |
| Actions | Button, IconButton, ButtonGroup | Button variants, loading/disabled, size and focus previewed; 8px corners for Button/IconButton; pill navigation remains separate |
| Content surfaces | Card | Live theme-connected specimens |
| Text entry | TextInput, TextArea | TextInput default and validation examples |
| Selection | CheckboxInput, Switch, RadioList | Checkbox and Switch interactive specimens |
| Feedback | Badge, Banner, Spinner, Toast | Badge status examples; Button uses native Spinner |
| Dialogs | Dialog, AlertDialog | Interactive Dialog with focus return |
| Navigation | Link, TabList, Tab, Breadcrumbs, SideNav, TopNav | Available upstream; select and verify when site structure is defined |
| Content organization | Collapsible, CollapsibleGroup, Divider, Tooltip | Available upstream; check the installed catalog/API before use |
| Menus and choice | DropdownMenu, Selector, MultiSelector, Typeahead | Available upstream; verify exact exports through CLI |
| Identity and media | Avatar, AspectRatio, Carousel | Available upstream; approved SVG logos remain separate |
| Website-specific patterns | Project card, gallery, article, personal hub | Compose later from these foundations and actual content |

The preview demonstrates the implemented subset; this is not a claim that all 168 upstream components were customized or tested. Prefer existing Astryx components and composition. Avoid swizzling/forking until a concrete requirement cannot be met through tokens or public overrides.

```text
npm run astryx -- component --list
npm run astryx -- component Button
npm run astryx -- component TextInput
npm run astryx -- docs tokens
npm run astryx -- docs author-a-theme
npm run astryx -- theme targets Button
```

## Space, type, layout, and motion

- Astryx `--spacing-1` is 4px, **not 2px**. `--spacing-0-5` is 2px. The 6px `--spacing-1-5` alias maps to 8px to preserve the requested sequence. Custom code can use explicit `--sg-space-24` style names.
- Dimensions use rem at a 16px root so browser text settings remain effective. Do not force the root font size to preserve pixels at the expense of accessibility. Even pixels describe nominal values at the default root.
- Sora H1–H5: 72/80, 48/56, 32/40, 24/32, 20/28 at weight 700. Supporting H6: 18/24. Inter paragraphs: 24/32, 16/24, 14/20, 12/16, each with Regular 400 and Bold 700. Display roles: 56/64, 64/72, 72/80. Mobile specimen H1/H2 reduce to 48/56 and 40/48; the table lists desktop nominal sizes. The documentation section headings use a compact 32/40 Sora treatment independently of the specimens.
- Control heights: 40/44/48px; coarse-pointer small controls become 44px. Icon-only controls must retain a meaningful accessible label. Checkbox and switch field hit areas should be at least 44px high.
- Content max: 1200px; reading max: 68ch. Site gutters: 20px mobile, 40px desktop. Section spacing: 48px mobile, 80px desktop. These are proposed website defaults, not a final page layout.
- Breakpoints: 640/768/1024/1280px. Let content wrap first; use breakpoint changes only where needed. The showcase also changes its documentation sidebar layout at 1200px.
- Shared motion: 120/200/320ms; standard ease `cubic-bezier(0.2, 0, 0, 1)`. Reduced motion removes animation and transitions. Shadows use 2/4/8px vertical offsets and 8/16/32px blur.
- Layer order: base 0, sticky 10, popover 20, overlay 30, dialog 40, toast 50, tooltip 60. Native dialogs use the browser top layer rather than relying on z-index alone.

## Validation and limits

`tokens/contrast-report.json` contains 370 checks across all 10 theme/mode pairs. The checker also verifies exact brand colors at 500, strictly darkening fixed brand scales, all SVG geometry and common logo canvases, spacing progression, even type sizes/line heights, shared neutral role equality across identities, and achromatic Design shades. TypeScript and the production build pass.

`previews/browser-report.json` records actual browser checks: theme switches, rendered button height/radius, loaded font faces, native Astryx input focus treatment, 8px actions versus rounded navigation, identical full-logo positions/sizes, sampled logo ink colors, upright logos and transparent surroundings, text entry, checkbox state, dialog autofocus/Escape/focus return, OS mode changes, and no horizontal page overflow at 1440/390/320px. At each width, the identity and mode controls remain sticky at the top, switching preserves scroll position, and section anchors clear the controls. The mobile identity row scrolls horizontally. A ResizeObserver sets the actual scroll offset so wrapping/font loading cannot hide headings behind the toolbar. Captures are in `previews/`.

Browser verification uses the bundled local Playwright and installed Chrome on this machine:

```text
node scripts/verify-browser.cjs
```

For another machine, set `SVNTHGT_PLAYWRIGHT` to a resolvable Playwright module and `SVNTHGT_CHROME` to the browser executable; `SVNTHGT_PREVIEW` changes the preview URL. Browser checks need a running server.

Astryx is currently beta. Use the lockfile; review updates deliberately and rerun the token, type, build, and interaction checks when upgrading. Its CSS relies on modern features including `light-dark()` and `@scope`; establish the public website's supported-browser policy before launch. No older-browser support is claimed here. The final site will still need content-specific accessibility review, keyboard coverage of added components, real font wrapping checks, and responsive review with actual content.

## Primary references

- [IBM logo guidance: defined color combinations for different backgrounds](https://www.ibm.com/design/language/ibm-logos/8-bar/)
- [Astryx documentation](https://astryx.atmeta.com/)
- [Astryx source and release setup](https://github.com/facebook/astryx)
- [Astryx core setup](https://github.com/facebook/astryx/blob/main/packages/core/README.md)
- [Phosphor React](https://github.com/phosphor-icons/react)
- [Sora on Google Fonts](https://fonts.google.com/specimen/Sora)
- [Inter on Google Fonts](https://fonts.google.com/specimen/Inter)
- [Graphie on Adobe Fonts](https://fonts.adobe.com/fonts/graphie)

Package-specific integration details were read from the installed 0.7.1 CLI and TypeScript declarations. Third-party package licenses remain with their packages. No existing identity files were modified.
