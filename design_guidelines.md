# Design Guidelines: The Job Bridge

## Design Approach

**Framework**: Hybrid approach combining Material Design's accessibility principles with modern SaaS aesthetics inspired by Linear and Notion for professional credibility.

**Rationale**: Employment platform requiring exceptional accessibility compliance (WCAG 2.1) while maintaining trust and professionalism. Material Design provides robust accessibility patterns; SaaS references ensure modern, credible appearance.

**Core Principles**: 
- Accessibility-first in every decision
- Empowering and professional tone
- Clear information hierarchy
- Trustworthy, stable design patterns

## Typography

**Font Stack**: 
- Primary: Inter (Google Fonts) - exceptional readability, modern professional
- Headings: Inter 600-700 weight
- Body: Inter 400 weight
- UI Elements: Inter 500 weight

**Scale**:
- Hero Headline: text-5xl md:text-6xl lg:text-7xl
- Section Headers: text-3xl md:text-4xl
- Subsections: text-2xl md:text-3xl
- Body Large: text-lg md:text-xl
- Body: text-base
- Small/Meta: text-sm

**Line Height**: Generous spacing for readability (leading-relaxed for body, leading-tight for headlines)

## Layout System

**Spacing Primitives**: Tailwind units of 4, 6, 8, 12, 16, 20, 24 (e.g., p-4, gap-8, mt-12, py-20)

**Grid System**:
- Container: max-w-7xl for full sections, max-w-4xl for content-focused areas
- Multi-column: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 for feature cards
- Gaps: gap-6 md:gap-8 for cards, gap-4 for tight groupings

**Section Padding**: py-16 md:py-24 lg:py-32 for vertical rhythm

## Component Library

**Navigation**:
- Sticky header with clear focus indicators
- Large tap targets (min 44px × 44px)
- Skip-to-content link for screen readers
- Mobile: Full-screen overlay menu with large touch targets

**Hero Section**:
- Full-width with supporting image showcasing diverse professionals
- Prominent headline with mission statement
- Dual CTAs: "Get Started" (primary) + "Learn More" (secondary)
- Trust indicator: "Trusted by 10,000+ job seekers with disabilities"

**Feature Cards**:
- Icon + Title + Description pattern
- 3-column grid on desktop, stacked mobile
- Consistent card height with padding p-6 md:p-8
- Icons from Heroicons (outline style, 2.5rem size)

**Forms**:
- High contrast labels and inputs
- Clear error states with icons and text
- Large input fields (min-h-12)
- Visible focus rings (ring-4)

**Buttons**:
- Primary: Large (px-8 py-4), rounded-lg
- Secondary: Outlined variant
- Clear :focus-visible states
- No subtle hover effects - strong, obvious feedback

**Dashboard Components**:
- Card-based layout for job listings and applications
- Status badges with clear semantic meaning (icons + text)
- Data tables with zebra striping, sortable headers
- Progress indicators for application status

**AI Tool Interfaces**:
- Clean forms with guided input sections
- Real-time feedback displays
- Step indicators for multi-step processes
- Generated content in distinct visual containers

## Accessibility Compliance

**Mandatory Standards**:
- WCAG 2.1 Level AA minimum
- Semantic HTML throughout
- ARIA labels for all interactive elements
- Keyboard navigation for all features
- Screen reader tested content structure

**Visual Accessibility**:
- Minimum 4.5:1 contrast for all text
- Focus indicators visible on all interactive elements
- No reliance on visual-only information
- Text resize support up to 200%

**Interactive Patterns**:
- Clear tab order
- Escape key closes modals/overlays
- Arrow keys for navigation where appropriate
- Form validation with clear error messaging

## Page Structures

**Homepage**: Hero (with image) → Value Proposition → Key Features (3-col) → How It Works → AI Tools Preview → Testimonials (2-col) → Trust Indicators → CTA Section → Footer

**Features Page**: Hero → Feature Grid (comprehensive 6-8 features, 3-col) → AI Capabilities Deep Dive → Accessibility Commitment → Integration Partners → CTA

**Job Search/Dashboard**: Filters Sidebar → Results Grid/List Toggle → Application Tracker → Saved Jobs

**AI Tools**: Step-by-step interface with clear progress → Input forms → Generated output display → Actions (save, edit, download)

## Images

**Hero Image**: Diverse group of professionals collaborating in modern workspace - emphasize inclusion and professionalism (full-width, subtle overlay for text contrast)

**Feature Sections**: Professional workplace photography showing assistive technology, remote work setups, inclusive office environments

**Testimonials**: Authentic headshots of users (with permission) to build trust

**AI Tool Screenshots**: Clean interface mockups showing the tools in action

**Background Treatment**: Subtle gradient overlays where text appears over images, ensuring buttons have blurred backdrop-blur-sm backgrounds

## Animations

**Minimal Use**:
- Smooth page transitions (200ms)
- Subtle fade-in on scroll for feature cards
- Focus indicator transitions
- NO distracting or looping animations

## Key Design Differentiators

- Generous whitespace communicates professionalism
- Consistent iconography from single library (Heroicons)
- Card-based information architecture for scannability
- Clear visual hierarchy guides users through complex features
- Professional photography showing real diverse professionals
- Trust-building elements throughout (testimonials, stats, certifications)