---
name: add-theme
description: Add a new visual theme to the Beads Kanban UI. Generates CSS variables, theme definition, and theme-specific effects from a design description or HTML mockup.
user-invocable: true
---

# Add New Theme

Create a new theme for the Beads Kanban UI theme system.

## Input

The user provides one of:
- A description of the desired visual style (colors, mood, inspiration)
- An HTML mockup file in `design/`
- A reference to an existing design system (e.g., "like Linear but warmer")

## Process

### Step 1: Choose theme properties

Determine these attributes:
- **id**: kebab-case identifier (e.g., `cyberpunk-neon`)
- **name**: Display name (e.g., "Cyberpunk Neon")
- **description**: One-line summary
- **mode**: `dark` or `light`
- **layout**: One of `standard`, `compact-row`, or `property-tags`

Layout guide:
- `standard` — Traditional card layout: ID row, title, description, footer. Best for themes with visual weight (shadows, borders, blur).
- `compact-row` — Row-like cards: priority bar left, ID + title inline. Best for minimal/dense themes.
- `property-tags` — Title-first cards with property tag pills below. Best for clean/productivity themes.

### Step 2: Define color palette

Define all color variables as HSL values (hue saturation% lightness%, no `hsl()` wrapper).

Required color groups (~25 variables):

```
Surface:      --surface-base, --surface-raised, --surface-overlay, --surface-inset
Text:         --text-primary, --text-secondary, --text-tertiary, --text-muted, --text-faint
Border:       --border-default, --border-subtle, --border-strong
Status:       --status-open, --status-progress, --status-review, --status-closed
Semantic:     --success, --warning, --danger, --info
Feature:      --epic, --blocked-accent
Priority:     --priority-p0 through --priority-p4
Progress:     --progress-100, --progress-75, --progress-50, --progress-25, --progress-0
```

For **light** themes, also override shadcn base variables:
```
--background, --foreground, --card, --card-foreground, --popover, --popover-foreground,
--primary, --primary-foreground, --secondary, --secondary-foreground, --muted,
--muted-foreground, --accent, --accent-foreground, --destructive, --destructive-foreground,
--border, --input, --ring
```

### Step 3: Define shape, typography, and effects

Required variables:

```css
/* Shape */
--radius-card: 0.75rem;       /* Card border radius */
--radius-column: 0.75rem;     /* Column border radius */
--radius-badge: 0.375rem;     /* Badge/tag border radius */
--border-w: 1px;              /* Primary border width */
--column-gap: 1rem;           /* Gap between kanban columns */

/* Typography */
--font-body: var(--font-inter), system-ui, sans-serif;
--font-heading: var(--font-space-grotesk), system-ui, sans-serif;
--font-mono: 'SF Mono', 'Fira Code', monospace;
--ls-title: -0.01em;          /* Letter-spacing for titles */
--ls-label: 0em;              /* Letter-spacing for badges/labels */

/* Effects */
--card-shadow: none;                   /* Card default shadow */
--card-hover-shadow: none;             /* Card hover shadow */
--card-blur: 0;                        /* Card backdrop-filter (use `blur(Xpx)` or `0`) */
--card-hover-y: 0px;                   /* Card translateY on hover */
--column-blur: 0;                      /* Column backdrop-filter */
--column-bg-alpha: 1;                  /* Column background opacity */
```

Available font CSS variables (loaded in layout.tsx):
- `var(--font-inter)` — Inter
- `var(--font-space-grotesk)` — Space Grotesk
- `var(--font-space-mono)` — Space Mono
- `var(--font-plus-jakarta)` — Plus Jakarta Sans

To add a new Google Font: add it to `src/app/layout.tsx` using `next/font/google`.

### Step 4: Write the files

#### 4a. Add CSS to `src/app/themes.css`

Add a new block at the end of the file, following the existing pattern:

```css
/* ------------------------------------------
 * THEME N: Theme Name
 * Short description
 * ------------------------------------------ */
html[data-theme="theme-id"] {
  /* Colors (~25 vars) */
  /* Shape (5 vars) */
  /* Typography (5 vars) */
  /* Effects (6 vars) */
}
```

#### 4b. Add theme-specific CSS (if needed)

At the bottom of `themes.css`, add rules for unique visual effects:

```css
/* Target specific elements within the theme */
html[data-theme="theme-id"] .theme-card { ... }
html[data-theme="theme-id"] .theme-card:hover { ... }
html[data-theme="theme-id"] .theme-column { ... }
html[data-theme="theme-id"] body { ... }
```

Common theme-specific effects:
- Background gradients on body (glassmorphism)
- Custom border styles (brutalist thick borders)
- Card background overrides (rgba for glass effects)
- Column background overrides (transparent for tag-based themes)

#### 4c. Register in `src/lib/themes.ts`

Add to the `THEMES` array:

```typescript
{
  id: 'theme-id',
  name: 'Theme Name',
  description: 'Short description',
  mode: 'dark',        // or 'light'
  layout: 'standard',  // or 'compact-row' or 'property-tags'
  preview: { bg: '#hex', surface: '#hex', text: '#hex', accent: '#hex' },
},
```

The `preview` colors are used in the theme switcher UI (settings page).

#### 4d. Update `src/components/theme-init.tsx` (light themes only)

If the theme is `mode: 'light'`, add its ID to the `lightThemes` set in the inline script so it loads without a dark flash on page load.

### Step 5: Verify

1. `npx next build` — must compile without errors
2. Open settings page — new theme appears in the switcher
3. Select the theme — verify colors, fonts, radius, shadows, layout
4. Check the kanban board with beads — cards render in the correct layout variant
5. Switch back to other themes — no leftover styles

## Reference: Existing themes

| ID | Mode | Layout | Font | Key visual traits |
|----|------|--------|------|-------------------|
| default | dark | standard | system-ui | Neutral dark, subtle borders |
| glassmorphism | dark | standard | Inter | Frosted glass, blur, gradient bg, glow shadows |
| neo-brutalist | dark | standard | Space Grotesk/Mono | 0 radius, 3px borders, offset shadows, uppercase |
| linear-minimal | dark | compact-row | Inter | Ultra-minimal, 1px dividers, row cards |
| soft-light | light | standard | Plus Jakarta Sans | White cards, soft shadows, pastel badges |
| notion-warm | light | property-tags | Inter | Warm beige, ring-shadow cards, tag pills |
| github-clean | light | property-tags | System font | Cool gray, pill labels, clean borders |

## Files touched

| File | What to change |
|------|---------------|
| `src/app/themes.css` | Add CSS variable block + theme-specific rules |
| `src/lib/themes.ts` | Add entry to `THEMES` array |
| `src/components/theme-init.tsx` | Add to `lightThemes` if light mode |
| `src/app/layout.tsx` | Add new Google Font if needed |
| `design/NN-theme-name.html` | Optional: create HTML mockup for reference |
