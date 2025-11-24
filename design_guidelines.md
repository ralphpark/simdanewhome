# SIMDA Plant Brand - Design Guidelines

## Design Approach

**Reference-Based Approach**: Drawing inspiration from premium lifestyle e-commerce (Airbnb's trust elements, The Sill's plant aesthetics, Notion's clean interfaces) to create a sophisticated yet approachable plant brand experience.

**Core Principles**: Natural sophistication, breathing room, trust-building through imagery, seamless transitions between consumer and B2B contexts.

---

## Typography

**Font Stack**: 
- Primary: Inter or Pretendard (Korean excellence) - clean, modern sans-serif
- Headings: 600-700 weight
- Body: 400-500 weight
- UI elements: 500 weight

**Scale**:
- Hero headlines: text-5xl md:text-6xl lg:text-7xl
- Section titles: text-3xl md:text-4xl
- Card titles: text-xl md:text-2xl
- Body text: text-base md:text-lg
- Small text/metadata: text-sm

---

## Layout System

**Spacing Primitives**: Tailwind units of 4, 6, 8, 12, 16, 20, 24 (e.g., p-4, gap-6, mt-12, py-20)

**Containers**:
- Full-width sections: `w-full` with inner `max-w-7xl mx-auto px-6 md:px-8`
- Content sections: `max-w-6xl mx-auto`
- Text-heavy areas: `max-w-prose mx-auto`

**Grid Patterns**:
- Service cards: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`
- Portfolio: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`
- Magazine: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`

---

## Component Library

### Navigation
- Sticky header with blur backdrop (`backdrop-blur-md`)
- Logo left, nav center/right split
- Mobile: hamburger menu with slide-out drawer
- External link indicators (small icon for simgo.kr, simda.me)

### Hero Section (Landing)
- **Layout**: Full viewport height (min-h-screen) with centered 3-choice card layout
- **Structure**: Large background image (plant lifestyle photography, slightly desaturated), overlay gradient for readability
- **Three Choice Cards**: Glass-morphism effect cards (`backdrop-blur-lg bg-white/10 border border-white/20`), each 350px wide, hover lift effect (translate-y-[-8px])
- **Card Content**: Icon/emoji top, question text, brief description, CTA button with blurred background

### Service Cards
- White cards with subtle shadow (`shadow-lg hover:shadow-2xl`)
- Icon/illustration top (80px height)
- Title, 2-3 line description
- CTA link/button bottom
- 16px padding, 12px border-radius equivalent

### AI Chatbot Interface
- **Container**: Fixed bottom-right, 400px width (mobile: full-width drawer)
- **Chat Window**: White background, message bubbles with distinct styling
- **User Messages**: Right-aligned, blue-tinted background (`bg-blue-50 border-l-4 border-blue-400`)
- **AI Messages**: Left-aligned, neutral background (`bg-gray-50 border-l-4 border-green-400`)
- **Input Area**: Sticky bottom, textarea with send button
- **Typing Indicator**: Animated dots (3 bouncing circles)

### Forms (Booking, B2B)
- **Layout**: Two-column on desktop (md:grid-cols-2), single column mobile
- **Inputs**: Full-width, consistent height (h-12), border style (`border-2 border-gray-200 focus:border-blue-500`)
- **Labels**: Above inputs, medium weight, small margin-bottom
- **Date/Time Pickers**: Custom styled to match brand
- **File Upload**: Drag-and-drop zone with dashed border
- **Submit Button**: Large, full-width on mobile, fixed width desktop (min-w-[200px])

### Portfolio Grid
- **Card Structure**: Image-first, hover reveal overlay with project details
- **Image**: aspect-ratio-[4/3], object-cover
- **Overlay**: Gradient from transparent to dark on hover
- **Modal/Detail**: Full-screen overlay with image gallery carousel, details sidebar

### Magazine Cards
- **Layout**: Vertical card, image top (aspect-ratio-[16/9])
- **Meta**: Date, category tag (small pill badges)
- **Title**: 2-line clamp
- **Description**: 3-line clamp
- **Read More**: Text link with arrow icon

### FAQ Accordion
- **Item**: Border-bottom separated, padding py-6
- **Question**: Flex layout with expand icon right
- **Answer**: Collapsible with smooth transition, pl-4 for indentation

### External Link Cards (Shop, Marketplace)
- **Hero-style Feature Block**: 60vh height, split layout (content left, visual right)
- **Features Grid**: 3-column icons with benefits
- **CTA**: Large button with external link icon, secondary "Learn More" option
- **Badge**: "External Service" indicator top-right

---

## Images

**Hero Section**: 
- Large lifestyle image of plants in modern interior (1920x1080)
- Subtle overlay gradient (from transparent to rgba(0,0,0,0.3))

**Service Sections**: 
- AI Chatbot: Mockup of chat interface or person using phone with plants
- Subscription: Flat-lay of plant delivery box
- Education: Person caring for plants or workshop setting
- Marketplace: Local shop or community market scene

**Portfolio**: 
- High-quality project photos (before/after, detail shots, wide angles)
- Minimum 1200px width for quality

**Magazine**: 
- Featured images for each post (16:9 ratio)
- Minimum 800px width

**B2B Section**: 
- Office space with plants, corporate environments

**About Page**: 
- Team photos, workspace, brand story imagery

---

## Interactive Elements

**Buttons**:
- Primary: Solid background, white text, medium padding (px-8 py-3)
- Secondary: Outline style, 2px border
- Blur background for buttons on images (`backdrop-blur-md bg-white/20`)
- Rounded corners (rounded-lg)

**Links**: 
- Underline on hover, smooth transition
- External links: small icon suffix

**Cards**: 
- Lift on hover (transform translate-y-[-4px])
- Shadow increase on hover
- Smooth transition-all (duration-300)

**Scroll Animations** (Minimal):
- Fade-in on scroll for section headings only
- Stagger children for card grids (delay-[100ms], delay-[200ms], etc.)
- No parallax or heavy animations

---

## Page-Specific Notes

**Landing**: 6-8 sections total - Hero (3 choices), Services Overview (4 cards), Latest Portfolio (slider), Latest Magazine (grid), B2B CTA, Footer

**Services**: Each service gets dedicated section with icon, description, benefits list, CTA

**Portfolio**: Filter tabs top, masonry or standard grid, lightbox for images

**Magazine**: Featured post hero, grid below, sidebar with categories/tags on desktop

**B2B**: Professional tone, case studies, downloadable PDF section, testimonials from corporate clients

**Admin**: Sidebar navigation, table views for data, form-based editors, minimal styling (utility-focused)

---

**Accessibility**: ARIA labels for interactive elements, focus states with visible outline (ring-2 ring-blue-500), keyboard navigation support, form error messages inline with red accent.