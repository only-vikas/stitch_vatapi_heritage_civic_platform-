---
name: Vatapi Heritage & Civic Platform
colors:
  surface: '#fbf9f6'
  surface-dim: '#dbdad7'
  surface-bright: '#fbf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f0'
  surface-container: '#efeeeb'
  surface-container-high: '#eae8e5'
  surface-container-highest: '#e4e2df'
  on-surface: '#1b1c1a'
  on-surface-variant: '#3d4947'
  inverse-surface: '#30312f'
  inverse-on-surface: '#f2f0ed'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#9a452c'
  on-secondary: '#ffffff'
  secondary-container: '#ff9475'
  on-secondary-container: '#762b14'
  tertiary: '#6f574f'
  on-tertiary: '#ffffff'
  tertiary-container: '#896f66'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#ffdbd1'
  secondary-fixed-dim: '#ffb5a0'
  on-secondary-fixed: '#3b0900'
  on-secondary-fixed-variant: '#7b2e17'
  tertiary-fixed: '#fddbd1'
  tertiary-fixed-dim: '#dfc0b6'
  on-tertiary-fixed: '#291711'
  on-tertiary-fixed-variant: '#58423a'
  background: '#fbf9f6'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2df'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 56px
    fontWeight: '600'
    lineHeight: 64px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: '0'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '500'
    lineHeight: 36px
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 30px
  title-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  gutter-lg: 2rem
  margin: 1.5rem
  margin-mobile: 1rem
  margin-desktop: 3rem
  space-xs: 0.5rem
  space-sm: 1rem
  space-md: 1.5rem
  space-lg: 2rem
  space-xl: 3rem
  space-2xl: 4rem
---

## Brand & Style

This design system establishes an architectural, culturally resonant interface tailored for Bagalkote’s heritage tourism and civic infrastructure. The design language marries the timeless monumentality of Badami Chalukya rock-cut cave temples with high-utility, modern AI intelligence. 

The aesthetic is grounded, dignified, and editorial, combining tactile warmth with civic clarity. It relies on generous sandstone-toned negative space, structural terracotta framework accents, and focused pulses of electric teal denoting real-time AI guidance, civic action, and interactive utilities. The atmosphere avoids both sterile administrative blandness and hyper-glossy modernism, evoking the tactile gravity of carved red sandstone alongside the crisp legibility of modern archival scholarship.

## Colors

The system uses a calibrated 60-30-10 distribution to balance cultural character with functional ergonomics:

- **60% Sandstone Neutrals (Canvas & Elevation):** 
  - Primary Canvas: `#FAF8F5` (warm sandstone base)
  - Surface Mid: `#F5F1EB` (card surfaces, sidebars)
  - Surface Border / Contrast Sandstone: `#EFECE6` (recessed inputs, dividers)
- **30% Deep Terracotta (Structure, Narrative, Framing):** 
  - Terracotta Base: `#8B3A22` (navigation headers, structural borders, key narrative headers)
  - Terracotta Bright: `#9E4327` (hover states, accented tags)
  - Terracotta Deep: `#6E2C17` (active structural components)
  - Deep Basalt Sandstone: `#2E1C16` (high-contrast typographic copy, iconography, dark containers)
- **10% Kinetic Teal (AI, Interactive Points, Highlights):**
  - Interactive Action: `#0D9488` (primary buttons, AI insights, key prompts)
  - AI Pulse / Hover: `#14B8A6` (live indicators, hover state)
  - Focused Accent: `#0F766E` (pressed states, secondary interactive badges)

### Status & Civic Signals
- **Critical / Urgent:** `#E11D48` (rose/red for structural alerts, site preservation hazards, critical civic reports)
- **Warning / Ongoing:** `#D97706` (amber/ochre for crowd warnings, pending restoration tickets)
- **Stable / Resolved:** `#0D9488` (teal alignment for completed civic items and verified itineraries)

## Typography

Typography establishes an intentional dichotomy between narrative depth and functional telemetry. 

- **Headlines & Editorial Features (Playfair Display):** Conveys the historical significance and cultural gravity of the Chalukya dynasty. Used for page titles, section introductions, AI-generated cultural narratives, and hero cards. Always rendered in Deep Basalt (`#2E1C16`) or Terracotta (`#8B3A22`) with controlled tracking.
- **Interface & Operational Data (Inter):** Maximizes optical scanning efficiency and cross-device clarity for civic workflows, metrics, crowd densities, coordinates, AI prompts, and microcopy. Uppercase treatment is reserved strictly for `label-md` and `label-sm` to maintain rigorous hierarchy without optical noise.

## Layout & Spacing

The layout is built upon an uncompromising 8pt mathematical rhythm (8px, 16px, 24px, 32px, 48px, 64px) governing all spatial intervals.

- **Responsive Grid:** 
  - **Mobile (< 768px):** 4 columns, 16px margins, 16px gutters. Structural blocks stack vertically.
  - **Tablet (768px - 1024px):** 8 columns, 24px margins, 24px gutters. Secondary civic metrics sit adjacent to map visuals.
  - **Desktop (> 1024px):** 12 columns, max-width 1360px centered, 48px margins, 24px to 32px gutters.
- **Spatial Rhythm:**
  - `space-xs` (8px): Internal tag gaps, icon-to-label separation, micro-padding.
  - `space-sm` (16px): Compact card internal padding, tight stack gaps.
  - `space-md` (24px): Standard card body padding, form row spacing.
  - `space-lg` (32px): Prominent hero card padding, major section element gaps.
  - `space-xl` (48px): Section breaks, thematic narrative dividers.
  - `space-2xl` (64px): Hero canvas offsets and civic dashboard milestone breaks.

## Elevation & Depth

Depth mimics the physical light and soft shadows found in stone corridors, avoiding artificial dark blurs or stark lines:

- **Level 0 (Flat Ground):** Sandstone `#FAF8F5` directly flush with canvas, delimited only by 1px subtle sandstone borders (`#EFECE6`).
- **Level 1 (Standard Surface / Cards):** Surface `#FFFFFF` or `#F5F1EB`.
  - Multi-tier ambient shadow: `0 2px 4px -1px rgba(46, 28, 22, 0.04), 0 4px 12px -2px rgba(46, 28, 22, 0.06)`.
- **Level 2 (Interactive Hover & Featured Artifacts):**
  - Extended multi-tier shadow: `0 8px 16px -4px rgba(46, 28, 22, 0.08), 0 16px 32px -8px rgba(46, 28, 22, 0.08)`.
- **Level 3 (Modals, AI Floating Assistants & Overlays):**
  - High depth: `0 20px 25px -5px rgba(46, 28, 22, 0.12), 0 8px 10px -6px rgba(46, 28, 22, 0.04)`.
- **Accent Glow (AI Active States):**
  - Subtle teal luminance: `0 0 0 1px #0D9488, 0 4px 14px 0 rgba(13, 148, 136, 0.25)`.

## Shapes

The shape system utilizes soft, confident curvatures that bridge structural permanence with digital tactility.

- **Micro / Standard Elements (8px - `rounded-md`):** Buttons, inputs, tags, notification pills, and nested controls default to a crisp 8px radius.
- **Medium Panels & Cards (12px - `rounded-lg`):** Informational cards, civic issue tiles, and search panels adopt a 12px curvature.
- **Prominent Highlights & Modals (16px - `rounded-xl`):** Primary heritage showcases, map overlays, AI insight drawers, and multi-tier civic report panels utilize a 16px radius for framed focus.
- **Pill Profiles (Fully Rounded):** Restricted exclusively to status tags, audio tour playheads, and AI real-time status chips.

## Components

### Buttons
- **Primary (AI & Call-to-Action):** Teal background (`#0D9488`), white text (`#FFFFFF`), 8px border radius, 8px/16px padding for standard, 12px/24px for prominent actions. Hover shifts to `#14B8A6`.
- **Secondary (Terracotta Structural):** Terracotta border (`#8B3A22`), text `#8B3A22`, transparent background. On hover, fills with light terracotta tint (`rgba(139, 58, 34, 0.06)`).
- **Ghost:** Deep Basalt (`#2E1C16`) text with no background, underlining on hover with a 2px Terracotta baseline.

### Chips & Badges
- **AI Recommendation Badge:** Teal surface (`rgba(13, 148, 136, 0.10)`), teal border (`rgba(13, 148, 136, 0.20)`), teal text (`#0F766E`), leading sparkle/AI glyph, full pill radius.
- **Civic Severity Badges:**
  - High/Urgent: `#FFE4E6` background, `#9F1239` text, `#FDA4AF` border.
  - Moderate: `#FEF3C7` background, `#92400E` text, `#FCD34D` border.
  - Low/Normal: `#CCFBF1` background, `#115E59` text, `#5EEAD4` border.

### Input Fields
- **Container:** Sandstone Surface (`#F5F1EB`), 1px outline (`#EFECE6`), 8px radius, text in `#2E1C16`.
- **Focus State:** White background (`#FFFFFF`), border `#0D9488`, subtle teal ring (`0 0 0 3px rgba(13, 148, 136, 0.15)`).
- **Labeling:** Floating or top-stacked `label-sm` in `#6E2C17`, maintaining 8px vertical baseline separation.

### Cards
- **Heritage Showcase Card:** 16px radius, warm surface `#FFFFFF`, 1px border `#EFECE6`, Playfair Display headline, subtle Level 1 shadow scaling to Level 2 on hover. Images showcase warm color grading aligning with Badami rock tones.
- **Civic Issue Card:** 12px radius, `#F5F1EB` background, left border stripe (4px) matched to severity status token, Inter typography for metrics, dates, and geo-coordinates.

### Lists & Key-Value Metrics
- **Dividers:** 1px solid `#EFECE6`. 
- **Row Spacing:** 16px vertical padding on 8pt intervals. Leading heritage icon or numerical step indicator encapsulated in an 8px Terracotta square container with 10% opacity.

### AI Exploration Panels
- Sandstone glass finish (`rgba(245, 241, 235, 0.94)` with `backdrop-filter: blur(12px)`), framed with a 1px border (`rgba(13, 148, 136, 0.30)`), incorporating generative path suggestions, voice translation inputs, and dynamic foot-traffic indicators.