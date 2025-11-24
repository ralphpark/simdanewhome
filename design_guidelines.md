# SIMDA Plant Brand - Design Guidelines

## Design Approach

**Reference-Based**: Premium plant lifestyle combining The Sill's botanical elegance, Airbnb's trust-building, and Linear's refined minimalism. Korean-optimized with glass-morphism accents for modern sophistication.

**Core Principles**: Natural serenity, generous breathing room, botanical professionalism, glass-morphism depth, smooth micro-interactions.

---

## Color System

**Primary Green**: `hsl(142, 76%, 36%)` - Natural, vibrant botanical green
**Variants**:
- Light: `hsl(142, 60%, 90%)` - Soft backgrounds
- Dark: `hsl(142, 80%, 25%)` - Accent elements
- Glass overlay: `hsl(142, 50%, 96%, 0.7)` - Frosted glass effects

**Neutrals**: White, gray-50 through gray-900 for text hierarchy
**Accents**: Warm terracotta `hsl(15, 70%, 60%)` for CTAs, soft blue `hsl(200, 70%, 50%)` for information

---

## Typography

**Font Stack**: Pretendard (Korean excellence) fallback to Inter
- Hero: `text-5xl md:text-7xl`, weight-700
- Section titles: `text-3xl md:text-5xl`, weight-600
- Card titles: `text-xl md:text-2xl`, weight-600
- Body: `text-base md:text-lg`, weight-400
- Small/meta: `text-sm`, weight-500

**Line Height**: Generous breathing - 1.7 for body, 1.2 for headings

---

## Layout System

**Spacing**: Tailwind units 4, 8, 12, 16, 24, 32 (py-24 for sections, gap-8 for grids)

**Containers**: 
- Full-width: `max-w-7xl mx-auto px-6 md:px-12`
- Content: `max-w-6xl mx-auto`
- Text: `max-w-3xl mx-auto`

**Grid Patterns**:
- Services: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8`
- Portfolio: `grid-cols-1 md:grid-cols-3 gap-12`
- Magazine: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`

---

## Component Library

### Navigation
Sticky with glass-morphism: `backdrop-blur-xl bg-white/80 border-b border-green-100/50`, logo left, bilingual nav (KO/EN toggle), mobile slide-out drawer with frosted background.

### Landing Page Hero
**Layout**: Full viewport (min-h-screen), large botanical lifestyle image (modern interior with lush plants, 2560x1440, soft natural light), gradient overlay `from-black/40 to-transparent`.

**Content**: Centered vertical stack, large Korean headline with English subtitle, three glass-morphism choice cards below (350px each, `backdrop-blur-lg bg-white/10 border border-white/30 shadow-2xl`), cards float with hover lift (`translate-y-[-12px]` smooth transition).

### Service Cards
White cards with botanical shadow (`shadow-lg shadow-green-100/20`), rounded-2xl, 80px illustrated icon top, title/description, green CTA link bottom, hover: shadow-2xl with slight scale.

### Glass-Morphism Elements
Chat interface, modal overlays, floating buttons: `backdrop-blur-xl bg-white/70 border border-white/40 shadow-xl`, subtle inner glow effect.

### AI Chatbot
Fixed bottom-right (400px), glass container, messages with green accent borders (user: `border-l-4 border-green-500`, AI: `border-l-4 border-green-300`), typing indicator with bouncing green dots.

### Forms
Two-column desktop, glass input backgrounds (`bg-white/50 backdrop-blur-sm border-2 border-green-100 focus:border-green-500`), h-14 inputs, green submit button with hover scale.

### Portfolio Grid
Masonry layout option, image-first cards (aspect-[4/3]), hover overlay with gradient and green accent line, modal with full-screen gallery carousel.

### Magazine Cards
Vertical, image 16:9 ratio, date/category pills with green background, title (2-line clamp), excerpt (3-line), green arrow link.

### External Link Cards (Shop/Marketplace)
Hero-style blocks (60vh), split layout, green gradient overlays, large CTA with external icon, "외부 서비스" badge top-right.

---

## Images

**Hero**: Large botanical lifestyle - modern minimalist interior with abundant healthy plants, natural light, Korean aesthetic (2560x1440)

**Services**: AI chat mockup, subscription box flat-lay, workshop scene, local market

**Portfolio**: High-quality project photos (1200px+), before/after comparisons, detail shots

**Magazine**: Featured post images (16:9, 1200px+)

**B2B**: Corporate office greenery, professional installations

**About**: Team with plants, workspace, brand story visuals

---

## Animations

**Micro-interactions**: 
- Button hover: scale-105 with shadow increase (duration-200)
- Card hover: lift + shadow (duration-300)
- Page scroll: subtle fade-in for section headings (once)
- Staggered grid children (100ms delays)

**Transitions**: All smooth, ease-in-out, no parallax, no heavy scroll-triggered animations.

---

## Page Architecture

**Landing**: Hero (3-choice), Services (4 cards), Latest Portfolio (6 items), Magazine Preview (3 featured), B2B CTA block, Rich Footer

**Services**: Individual pages with hero, detailed benefits, FAQ accordion, booking CTA

**Portfolio**: Filter tabs, masonry grid, lightbox, project detail modals

**Magazine**: Featured hero post, grid (9-12 items), sidebar categories/tags (desktop)

**B2B**: Professional hero, case studies grid, downloadable resources, corporate testimonials, contact form

**Admin**: Sidebar navigation, minimal styling, table views, form editors

---

## Accessibility

ARIA labels, visible focus states (`ring-2 ring-green-500`), keyboard navigation, 1.5:1 minimum touch targets, inline form errors with red accent, Korean screen reader optimization.