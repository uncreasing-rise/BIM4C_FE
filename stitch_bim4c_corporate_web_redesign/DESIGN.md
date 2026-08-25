---
name: Industrial Integrity
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#44474f'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#747780'
  outline-variant: '#c4c6d0'
  surface-tint: '#475e8d'
  primary: '#001b42'
  on-primary: '#ffffff'
  primary-container: '#16305c'
  on-primary-container: '#8299cb'
  inverse-primary: '#afc6fb'
  secondary: '#b90d1c'
  on-secondary: '#ffffff'
  secondary-container: '#dd2e32'
  on-secondary-container: '#fffbff'
  tertiary: '#081c3b'
  on-tertiary: '#ffffff'
  tertiary-container: '#1f3152'
  on-tertiary-container: '#8899c0'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#afc6fb'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#2e4673'
  secondary-fixed: '#ffdad6'
  secondary-fixed-dim: '#ffb3ad'
  on-secondary-fixed: '#410003'
  on-secondary-fixed-variant: '#930011'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#b5c6ef'
  on-tertiary-fixed: '#071b3b'
  on-tertiary-fixed-variant: '#364769'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
  deep-navy: '#0D2040'
  structural-red: '#D0242A'
  concrete-gray: '#333333'
  paper-white: '#FFFFFF'
typography:
  display-lg:
    fontFamily: Barlow Condensed
    fontSize: 72px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: 0.04em
  headline-lg:
    fontFamily: Barlow Condensed
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.04em
  headline-lg-mobile:
    fontFamily: Barlow Condensed
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.04em
  headline-md:
    fontFamily: Barlow Condensed
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  title-lg:
    fontFamily: Barlow Condensed
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.1em
  body-lg:
    fontFamily: Libre Franklin
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Libre Franklin
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Barlow Condensed
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.15em
spacing:
  margin-edge: 4rem
  gutter: 1.5rem
  section-gap: 8rem
  stack-sm: 0.5rem
  stack-md: 1.5rem
  stack-lg: 3rem
---

## Brand & Style

This design system embodies the scale and precision of a construction titan. The visual narrative is rooted in **Industrial Minimalism**, prioritizing structural clarity, raw power, and corporate authority. It is designed for BIM4C to evoke a sense of massive architectural scale and uncompromising reliability.

The aesthetic is characterized by "Absolute Zero" geometry—no rounded corners are permitted, reflecting the hard edges of steel and concrete. Visual interest is generated through high-contrast typography, heavy horizontal rules, and sophisticated image treatments like navy-tinted duotones and "double-frame" effects that mimic architectural blueprints or structural framing.

## Colors

The palette is anchored by a commanding "Navy Blue" that represents stability and professionalism. 

- **Primary (Navy Blue):** Used for large surface areas, hero sections, and primary navigation backgrounds.
- **Secondary (Accent Red):** Used sparingly for critical calls-to-action, status indicators, and thin structural accents.
- **Tertiary (Navy Dark):** Reserved for deep depth, footers, and overlay gradients to ensure text legibility on imagery.
- **Neutral:** A range of architectural grays and "paper" whites provide a clean, technical backdrop that allows photography to stand out.

**Image Treatment:** Photography should utilize a navy duotone overlay (#16305C at 40-60% opacity) in background contexts to maintain consistent brand presence across varying image quality.

## Typography

The typography system uses a high-contrast pairing to distinguish between "Structural" and "Informational" content.

- **Headlines & Navigation:** Utilize **Barlow Condensed**. All major headings must be **Uppercase** with expanded letter-spacing (tracking). This creates an authoritative, industrial feel reminiscent of blueprints and construction signage.
- **Body & Data:** Utilize **Libre Franklin**. This sans-serif provides excellent legibility for long-form content, technical specifications, and corporate reporting.
- **Vertical Rhythm:** Headings should be accompanied by a 2px or 4px horizontal rule (primary or secondary color) to ground the text in the layout.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy to mirror the rigid precision of engineering.

- **Grid:** A 12-column grid system with 24px (1.5rem) gutters.
- **Margins:** Generous outer margins (64px+) on desktop to create a centered, prestigious content well.
- **Breakpoints:** 
  - **Desktop (1200px+):** 12 columns, wide margins.
  - **Tablet (768px - 1199px):** 8 columns, 32px margins.
  - **Mobile (<767px):** 4 columns, 16px margins.
- **Sectioning:** Content sections are separated by significant vertical whitespace (Section Gap) to allow the "weight" of each block to be felt. Large imagery often spans the full grid width to emphasize scale.

## Elevation & Depth

This design system rejects traditional shadows in favor of **Tonal Layering** and **Structural Framing**.

- **Flat Depth:** Depth is achieved through color blocking (e.g., a Navy Dark section following a White section) rather than drop shadows.
- **The "Double Frame" Effect:** Images and key containers should often feature a secondary border offset by 8px or 16px, or be encased in a thick solid border of a contrasting brand color.
- **Overlays:** Use Navy Dark gradients (0% to 80% opacity) at the bottom of hero images to provide a "foundation" for white display text.
- **Borders:** Use 1px solid borders in `#ECECEC` for subtle separation, or 4px solid blocks of `#16305C` for strong structural emphasis.

## Shapes

The shape language is strictly **Geometric and Sharp**. 

- **Corner Radius:** Every element—buttons, cards, input fields, and images—must have a `0px` border radius. 
- **Icons:** Use thin-stroke, rectangular icons. Avoid rounded or bubbly icon sets.
- **Dividers:** Use heavy, solid horizontal rules. Avoid dashed lines or soft gradients.

## Components

- **Buttons:** Rectangular with `0px` radius. Primary buttons are solid Navy Blue with White text. Hover state shifts to Accent Red. Button text is always Uppercase Barlow Condensed with 0.1em tracking.
- **Input Fields:** 1px solid Concrete Gray border. Focused state uses a 2px Navy Blue border. No rounded corners.
- **Cards:** Cards do not use shadows. Instead, they use a 1px border or a slight background tint. Project cards feature a full-bleed image with a navy duotone hover effect.
- **Double Frame (Image):** A specific component for featured imagery where the image is contained within a Navy Blue frame, but offset slightly from a secondary outer border.
- **Chips/Tags:** Small rectangular blocks with solid background colors and white uppercase text.
- **Lists:** Use custom "plus" (+) symbols or horizontal dashes as bullet points instead of standard circles.
- **Navigation:** Top-level links are uppercase with a persistent 2px underline appearing on hover.