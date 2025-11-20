# Lingo Mingle - Design Specification 2025

**Created:** 2025-11-20
**Based on:** iOS Design Trends 2025, Apple Design Awards Winners, Human Interface Guidelines

---

## 🎨 Design Philosophy

Lingo Mingle follows modern iOS design principles for 2025, emphasizing:
- **Clarity** - Clean, readable interfaces with purposeful hierarchy
- **Deference** - Content takes priority over chrome
- **Depth** - Layered, dimensional interfaces using glassmorphism
- **Consistency** - Predictable patterns across the entire app

---

## 📐 Layout & Spacing

### 8pt Grid System
All spacing, padding, and sizing follows the **8pt grid system** (multiples of 8):
- **Micro spacing:** 4px, 8px
- **Standard spacing:** 12px, 16px, 24px
- **Large spacing:** 32px, 40px, 48px
- **Section spacing:** 56px, 64px

### Touch Targets
- **Minimum touch target:** 44x44pt (Apple HIG requirement)
- **Recommended:** 48x48pt or larger for primary actions
- **Icon buttons:** 44x44pt minimum
- **Text buttons:** 44pt height minimum

### Screen Margins
- **Mobile (< 768px):** 16px horizontal padding
- **Tablet:** 24px horizontal padding
- **Safe area:** Respect iOS safe area insets (top notch, bottom indicator)

---

## 🎭 Visual Style

### Glassmorphism (Primary Style)
Modern iOS apps in 2025 heavily use **glassmorphism** for cards, modals, and overlays:

```css
/* Glassmorphic Card */
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.2);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
```

**When to use:**
- Modal dialogs and overlays
- Navigation bars and tab bars
- Card components over colorful backgrounds
- Floating action buttons

**Requirements:**
- Semi-transparent background (opacity 0.05-0.15)
- Backdrop blur (10-30px)
- Subtle border (white with 10-20% opacity)
- Soft shadow for depth

### Soft UI / Neumorphism
Used sparingly for interactive elements like buttons and toggles:

```css
/* Soft UI Button */
background: linear-gradient(145deg, #f0f0f0, #cacaca);
box-shadow:
  8px 8px 16px rgba(0, 0, 0, 0.1),
  -8px -8px 16px rgba(255, 255, 255, 0.8);
border-radius: 16px;
```

**When to use:**
- Primary action buttons
- Toggle switches
- Input fields (subtle)

### Border Radius
Modern iOS apps use generous corner radius for friendly, approachable feel:

- **Buttons:** 12px - 16px
- **Cards:** 16px - 24px
- **Modals:** 24px - 32px
- **Images:** 12px - 16px
- **Avatar circles:** 50% (full circle)
- **Pills/Tags:** 999px or 50%

---

## 🌈 Color System

### Principles
- **Adaptive colors** - Support both light and dark mode
- **Dynamic contrast** - Auto-adjust based on system settings
- **Vibrant gradients** - Use gradients for primary elements
- **Purposeful accents** - Color carries meaning

### Primary Color Palette
Based on current app themes, we'll enhance with gradients:

**Light Mode:**
```css
--primary: #6366f1;        /* Vibrant indigo */
--primary-dark: #4f46e5;   /* Darker shade */
--gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

--secondary: #ec4899;      /* Pink accent */
--gradient-secondary: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);

--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;

--background: #fafafa;     /* Soft white */
--surface: rgba(255, 255, 255, 0.8);  /* Glassmorphic */
--border: rgba(0, 0, 0, 0.08);

--text-primary: #1f2937;   /* Nearly black */
--text-secondary: #6b7280; /* Medium gray */
--text-muted: #9ca3af;     /* Light gray */
```

**Dark Mode:**
```css
--primary: #818cf8;        /* Lighter indigo for dark */
--primary-dark: #6366f1;
--gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

--secondary: #f472b6;
--gradient-secondary: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);

--success: #34d399;
--warning: #fbbf24;
--error: #f87171;

--background: #0f0f0f;     /* True black */
--surface: rgba(255, 255, 255, 0.05);  /* Dark glassmorphic */
--border: rgba(255, 255, 255, 0.1);

--text-primary: #f9fafb;   /* Nearly white */
--text-secondary: #d1d5db; /* Light gray */
--text-muted: #9ca3af;     /* Medium gray */
```

### Gradient Usage
**Where to use gradients:**
- Primary CTAs (Call-to-Action buttons)
- Hero sections and headers
- Active/selected states
- Brand moments (splash screens, empty states)

**Gradient patterns:**
```css
/* Vibrant */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Sunset */
background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);

/* Ocean */
background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);

/* Forest */
background: linear-gradient(135deg, #0ba360 0%, #3cba92 100%);
```

---

## ✍️ Typography

### Font Family
**San Francisco** (iOS system font) or **Inter** (web alternative)

```css
font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
```

### Type Scale (Based on 8pt grid)
```css
--text-xs: 12px;     /* Small labels */
--text-sm: 14px;     /* Secondary text */
--text-base: 16px;   /* Body text */
--text-lg: 18px;     /* Emphasized text */
--text-xl: 20px;     /* Small headings */
--text-2xl: 24px;    /* Section headings */
--text-3xl: 30px;    /* Page titles */
--text-4xl: 36px;    /* Hero text */
```

### Font Weights
```css
--font-regular: 400;
--font-medium: 500;   /* Preferred for iOS */
--font-semibold: 600; /* Headings */
--font-bold: 700;     /* Emphasis only */
```

### Line Height
```css
--leading-tight: 1.2;   /* Headings */
--leading-normal: 1.5;  /* Body text */
--leading-relaxed: 1.75; /* Long-form content */
```

### Best Practices
- **Default size:** 17pt for body text (Apple recommendation)
- **Use SF Pro Rounded** for friendly, approachable feel
- **Dynamic Type:** Support user font size preferences
- **Readability:** Minimum 14pt for body text
- **Hierarchy:** Use size + weight + color to create clear hierarchy

---

## 🎬 Motion & Animation

### Principles
- **Purposeful:** Every animation serves a function
- **Natural:** Follow physics (ease-in-out, spring)
- **Quick:** 200-400ms for most transitions
- **Responsive:** Immediate feedback on interaction

### Easing Functions
```css
/* Standard iOS easing */
--ease-ios: cubic-bezier(0.4, 0.0, 0.2, 1);

/* Bounce (for playful moments) */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* Smooth slide */
--ease-slide: cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

### Animation Timings
```css
--duration-fast: 150ms;     /* Micro-interactions */
--duration-base: 250ms;     /* Standard transitions */
--duration-slow: 400ms;     /* Complex animations */
--duration-modal: 300ms;    /* Modal open/close */
```

### Common Animations

**Fade In:**
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
animation: fadeIn 250ms ease-ios;
```

**Slide Up (iOS style):**
```css
@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
animation: slideUp 300ms ease-ios;
```

**Scale (Button press):**
```css
@keyframes press {
  from { transform: scale(1); }
  to { transform: scale(0.95); }
}
/* On active/pressed state */
```

### Micro-interactions
- **Button tap:** Scale down to 0.95 (100ms)
- **Toggle switch:** Slide animation (200ms)
- **Card tap:** Lift up with shadow increase (150ms)
- **Loading:** Gentle pulse or skeleton shimmer
- **Success:** Check mark with scale + fade (300ms)

---

## 🧩 Component Patterns

### Cards
```css
.card {
  background: var(--surface);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 16px;
  border: 1px solid var(--border);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transition: all 250ms var(--ease-ios);
}
```

### Buttons

**Primary (Gradient):**
```css
.btn-primary {
  background: var(--gradient-primary);
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  min-height: 48px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn-primary:active {
  transform: scale(0.95);
}
```

**Secondary (Ghost):**
```css
.btn-secondary {
  background: transparent;
  color: var(--primary);
  border: 2px solid var(--primary);
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
}
```

**Icon Button:**
```css
.btn-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  backdrop-filter: blur(10px);
}
```

### Navigation Bar (iOS style)
```css
.navbar {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid var(--border);
  padding: 8px 16px;
  position: sticky;
  top: 0;
  z-index: 100;
}

/* Large Title (iOS) */
.navbar-title-large {
  font-size: 34px;
  font-weight: 700;
  padding: 16px 16px 8px;
}
```

### Tab Bar (Bottom Navigation)
```css
.tab-bar {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px) saturate(180%);
  border-top: 1px solid var(--border);
  padding: 8px 0 calc(8px + env(safe-area-inset-bottom));
  display: flex;
  justify-content: space-around;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  min-width: 60px;
}

.tab-item.active {
  color: var(--primary);
}
```

### Input Fields
```css
.input {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 16px;
  min-height: 48px;
}

.input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
```

### Modals & Sheets
```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}

.modal {
  background: var(--background);
  border-radius: 24px 24px 0 0;
  padding: 24px;
  max-width: 500px;
  margin: auto;
  /* Slides up from bottom (iOS style) */
}

/* Sheet handle */
.modal::before {
  content: '';
  display: block;
  width: 36px;
  height: 4px;
  background: var(--text-muted);
  border-radius: 2px;
  margin: -12px auto 16px;
}
```

### Lists
```css
.list-item {
  background: var(--surface);
  padding: 12px 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 60px;
}

.list-item:active {
  background: rgba(0, 0, 0, 0.05);
}

/* Chevron indicator */
.list-item::after {
  content: '›';
  margin-left: auto;
  color: var(--text-muted);
  font-size: 24px;
}
```

---

## 🎯 Gesture Patterns

### Swipe Actions
- **Swipe left:** Reveal destructive actions (delete, archive)
- **Swipe right:** Reveal primary actions (complete, approve)
- **Pull down:** Refresh content
- **Pull up:** Load more / Show sheet

### Implementation
```css
/* Swipeable item */
.swipeable {
  position: relative;
  transform: translateX(0);
  transition: transform 300ms var(--ease-ios);
}

.swipeable.swiped-left {
  transform: translateX(-120px);
}

/* Action revealed behind */
.swipe-action {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 120px;
  background: var(--error);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}
```

---

## 🌓 Dark Mode

### Implementation Strategy
- **System preference:** Auto-detect and respect user's OS setting
- **Manual toggle:** Allow users to override system preference
- **Adaptive components:** All components adapt colors automatically

### Dark Mode Colors
- Use **true black (#0f0f0f)** not gray for background
- Increase **glassmorphism opacity** (0.05 instead of 0.1)
- Use **lighter primary colors** for better contrast
- **Reduce shadows** - use subtle glows instead

### Example
```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0f0f0f;
    --surface: rgba(255, 255, 255, 0.05);
    --text-primary: #f9fafb;
  }
}
```

---

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile first */
--mobile: 0px;        /* 320px+ */
--tablet: 768px;      /* iPad portrait */
--desktop: 1024px;    /* iPad landscape */
--wide: 1440px;       /* Desktop */
```

### Touch vs Click
- **Mobile:** Larger touch targets (48px minimum)
- **Desktop:** Hover states, cursor feedback
- **Adaptive:** Hide/show controls based on input method

---

## ✨ Special Effects

### Backdrop Blur (Glassmorphism)
```css
backdrop-filter: blur(20px) saturate(180%);
-webkit-backdrop-filter: blur(20px) saturate(180%);
```

### Shadows
```css
/* Soft shadow (cards) */
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

/* Elevated shadow (modals) */
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);

/* Floating shadow (FABs) */
box-shadow: 0 12px 40px rgba(99, 102, 241, 0.3);

/* Dark mode - use glow instead */
box-shadow: 0 0 24px rgba(99, 102, 241, 0.5);
```

### Gradients
```css
/* Mesh gradient (modern, complex) */
background:
  radial-gradient(at 40% 20%, rgba(99, 102, 241, 0.3) 0, transparent 50%),
  radial-gradient(at 80% 0%, rgba(236, 72, 153, 0.3) 0, transparent 50%),
  radial-gradient(at 0% 50%, rgba(16, 185, 129, 0.3) 0, transparent 50%);

/* Animated gradient */
background: linear-gradient(270deg, #667eea, #764ba2, #f093fb);
background-size: 600% 600%;
animation: gradientShift 15s ease infinite;

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```

---

## 🎨 Icons

### Style
- **Lucide React** (current) - Modern, consistent, 24px default
- **SF Symbols** style - Rounded, friendly, Apple-like
- **Stroke weight:** 2px (medium)
- **Size:** 20px (small), 24px (default), 32px (large)

### Usage
```jsx
import { Heart, Star, Settings } from 'lucide-react';

<Heart size={24} strokeWidth={2} />
```

---

## 📋 Checklist: Modern iOS App

- [ ] **8pt grid system** for all spacing
- [ ] **Glassmorphism** on cards, nav bars, modals
- [ ] **Generous border radius** (16px+ for cards)
- [ ] **Gradient primary buttons** with shadow
- [ ] **Dark mode support** with true black
- [ ] **Swipe gestures** for actions
- [ ] **Bottom navigation** (thumb-friendly)
- [ ] **Purposeful micro-interactions**
- [ ] **San Francisco / Inter** typography
- [ ] **Minimum 44pt touch targets**
- [ ] **Backdrop blur effects**
- [ ] **Smooth animations** (200-400ms)
- [ ] **Dynamic Type support**
- [ ] **Safe area respect** (notch, home indicator)
- [ ] **Vibrant gradients** for brand moments

---

## 🔗 References

- **Apple Human Interface Guidelines:** https://developer.apple.com/design/human-interface-guidelines/
- **Apple Design Awards 2025:** https://developer.apple.com/design/awards/
- **iOS Design Trends 2025:** Multiple sources on glassmorphism, gestures, AI personalization
- **8pt Grid System:** https://builttoadapt.io/intro-to-the-8-point-grid-system-d2573cde8632

---

**Last Updated:** 2025-11-20
**Version:** 1.0
**Status:** Ready for implementation
