# Web Design Guidelines Skill

## Overview
This skill provides comprehensive web design guidelines covering typography, color theory, accessibility (WCAG), responsive design, and modern CSS techniques. Use it to ensure UI implementations meet professional standards.

## When to Use
- Designing or reviewing web UI components
- Checking color contrast and accessibility compliance
- Implementing responsive layouts
- Choosing typography systems
- Applying modern CSS patterns

## Typography Guidelines

### Font Scale (Modular Scale 1.25)
```
xs:   0.64rem  (10.2px)
sm:   0.8rem   (12.8px)
base: 1rem     (16px)
lg:   1.25rem  (20px)
xl:   1.563rem (25px)
2xl:  1.953rem (31.25px)
3xl:  2.441rem (39px)
4xl:  3.052rem (48.8px)
```

### Font Pairing Principles
- Use max 2 font families: one for headings, one for body
- Heading fonts: geometric sans (Inter, DM Sans) or serif (Playfair Display, Fraunces)
- Body fonts: humanist sans (Inter, Source Sans) at 16-18px base
- Line height: 1.4-1.6 for body, 1.1-1.3 for headings
- Letter spacing: -0.02em to -0.04em for large headings, 0.05em for small caps

### Readability Rules
- Max line length: 60-75 characters (45-85ch acceptable)
- Paragraph spacing: 1.5× font size
- Minimum body font: 16px (14px for secondary info only)

## Color System

### Palette Architecture
```
Primary:   Brand color (5 shades: 50-900)
Neutral:   Grays for text/backgrounds (10 shades)
Semantic:  success/warning/error/info
Surface:   background, surface, elevated
```

### WCAG 2.1 Contrast Ratios
| Level | Normal Text | Large Text (18px+) |
|-------|-------------|-------------------|
| AA    | 4.5:1       | 3:1               |
| AAA   | 7:1         | 4.5:1             |

### Color Usage Rules
- Never convey information with color alone (add icons/labels)
- Dark mode: flip neutral scale, maintain semantic colors
- Interactive states: hover (+10% lightness), active (-10%), disabled (40% opacity)

### Tailwind Color Palette Reference
```css
/* Brand primary example */
--color-primary-50:  #eff6ff;
--color-primary-500: #3b82f6;
--color-primary-900: #1e3a5f;

/* Neutrals */
--color-gray-50:  #f9fafb;
--color-gray-100: #f3f4f6;
--color-gray-500: #6b7280;
--color-gray-900: #111827;
```

## Accessibility (WCAG 2.1 AA)

### Keyboard Navigation
- All interactive elements focusable via Tab
- Visible focus indicator (min 2px outline, 3:1 contrast with background)
- Logical tab order following visual flow
- Skip-to-content link as first focusable element

### ARIA Patterns
```html
<!-- Buttons -->
<button aria-label="Close dialog" aria-pressed="false">

<!-- Forms -->
<label for="email">Email</label>
<input id="email" type="email" aria-describedby="email-hint" aria-invalid="true">
<span id="email-hint" role="alert">Enter a valid email address</span>

<!-- Icons -->
<svg aria-hidden="true" focusable="false">...</svg>

<!-- Loading states -->
<div role="status" aria-live="polite">Loading...</div>
```

### Touch Targets
- Minimum 44×44px touch target (48×48px recommended)
- 8px minimum spacing between targets
- Use padding to increase hit area without changing visual size

### Motion & Animation
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Responsive Design

### Breakpoint System
```css
/* Mobile-first breakpoints */
sm:  640px   /* Small tablets */
md:  768px   /* Tablets */
lg:  1024px  /* Laptops */
xl:  1280px  /* Desktops */
2xl: 1536px  /* Large screens */
```

### Layout Patterns
```css
/* Fluid grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
  gap: clamp(1rem, 3vw, 2rem);
}

/* Responsive typography */
.heading {
  font-size: clamp(1.5rem, 5vw, 3rem);
}

/* Container with safe padding */
.container {
  width: min(100% - 2rem, 1200px);
  margin-inline: auto;
}
```

### Spacing Scale (4px base)
```
1:  4px    5: 20px   9:  36px
2:  8px    6: 24px   10: 40px
3: 12px    7: 28px   12: 48px
4: 16px    8: 32px   16: 64px
```

## Modern CSS Patterns

### Custom Properties for Theming
```css
:root {
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  --shadow-sm: 0 1px 2px rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
```

### CSS Logical Properties
```css
/* Prefer logical over physical */
margin-block: 1rem;      /* vs margin-top/bottom */
padding-inline: 1.5rem; /* vs padding-left/right */
inset-inline-start: 0;  /* vs left: 0 */
```

### Component Patterns
```css
/* Card */
.card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: clamp(1rem, 3vw, 1.5rem);
}

/* Button reset */
.button {
  all: unset;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  padding: 0.5em 1em;
  border-radius: var(--radius-md);
  transition: background-color 150ms ease;
}
```

## Design Tokens Checklist
- [ ] Colors: primary, neutral, semantic, surface palettes defined
- [ ] Typography: scale, families, weights documented
- [ ] Spacing: consistent scale applied throughout
- [ ] Shadows: elevation system (sm/md/lg)
- [ ] Radius: consistent border-radius values
- [ ] Animation: duration/easing tokens for transitions
- [ ] Contrast: all text/background combos pass WCAG AA

## Quick Audit Checklist
- [ ] Color contrast ≥ 4.5:1 for normal text
- [ ] Interactive elements have visible focus states
- [ ] Touch targets ≥ 44×44px
- [ ] Images have alt text
- [ ] Form inputs have labels
- [ ] Page has logical heading hierarchy (h1→h2→h3)
- [ ] Respects prefers-reduced-motion
- [ ] Works at 200% zoom without horizontal scroll
