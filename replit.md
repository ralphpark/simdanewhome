# SIMDA Plant Brand - Premium Plant Lifestyle Platform

## Overview

SIMDA is a premium Korean plant brand that combines AI-powered plant curation, subscription services, educational programs, and B2B collaboration. The platform serves as a comprehensive ecosystem connecting plant enthusiasts with expert guidance, curated products, and a community marketplace.

The application features an AI chatbot powered by Google Gemini that provides personalized plant recommendations based on user environment, experience level, and preferences. Users can book consultations, explore portfolios, read plant care content, and access both a direct online shop (simgo.kr) and a regional marketplace (simda.me).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript using Vite as the build tool

**Routing**: Wouter for lightweight client-side routing

**UI Components**: Radix UI primitives with shadcn/ui design system in "new-york" style
- Comprehensive component library including dialogs, forms, cards, calendars, accordions
- Tailwind CSS for styling with custom design tokens
- Korean-optimized typography using Pretendard font with Inter fallback
- Glass-morphism design elements with botanical green color palette (hsl(142, 76%, 36%))

**State Management**: TanStack Query (React Query) for server state and data fetching
- Query client configured with infinite stale time and disabled refetching
- Centralized API request handling with error management

**Form Handling**: React Hook Form with Zod schema validation
- Type-safe form validation using drizzle-zod schemas
- Integrated with shadcn/ui form components

**Key Pages**:
- Home: Hero section with service selection (buy plants, get recommendations, learn)
- Services: Detailed service offerings (AI curation, subscription, education, marketplace)
- Portfolio: Filterable project showcase
- Magazine: Blog/content platform with search and category filtering
- Booking: Consultation scheduling with calendar integration
- B2B: Corporate collaboration proposal submission
- Shop: Gateway to external online shop (simgo.kr)
- Support: FAQ accordion with customer service contact options

### Backend Architecture

**Runtime**: Node.js with Express.js framework

**Development Server**: Vite middleware integration for HMR in development
- Custom dev server setup with index.html template injection
- Production server serves static files from dist/public

**API Structure**:
- RESTful endpoints under `/api/*` prefix
- Chat endpoint: POST `/api/chat` for AI conversations
- Bookings: POST/GET `/api/bookings` with status updates
- B2B Proposals: POST/GET `/api/b2b-proposals` with status management
- Portfolios: Full CRUD operations
- Posts: Full CRUD with view count tracking

**Storage Layer**:
- Interface-based storage abstraction (IStorage)
- In-memory storage implementation (MemStorage) for development
- Database-backed storage ready for production (db.ts uses Drizzle ORM)

**Logging**: Custom timestamp-based logging middleware tracking request duration and JSON responses

### Database Architecture

**ORM**: Drizzle ORM with PostgreSQL dialect

**Database Provider**: Neon serverless PostgreSQL with WebSocket support
- Connection pooling via @neondatabase/serverless
- Schema-first design with TypeScript types

**Schema Design**:

1. **chat_histories**: AI conversation tracking
   - sessionId, userMessage, aiResponse, timestamps
   
2. **bookings**: Consultation appointments
   - Contact info, consultation type, preferred date/time
   - Status workflow (pending → confirmed → completed/cancelled)
   - Optional AI recommendation field

3. **b2b_proposals**: Corporate partnership requests
   - Company details, proposal content, attachment URLs
   - Status workflow (pending → reviewing → accepted/rejected)

4. **portfolios**: Project showcase
   - Title, description, category, client, location
   - Image URLs, completion date, tags, featured flag

5. **posts**: Magazine/blog content
   - Title, content, excerpt, category, author
   - Featured image, tags, published status, view count

**Schema Validation**: Zod schemas generated from Drizzle schema using drizzle-zod for runtime validation

### AI Integration

**Provider**: Google Gemini AI via Replit AI Integrations service
- Model: gemini-2.5-flash
- No API key required when using Replit AI Integrations

**Implementation**:
- Conversational AI plant curator with system prompt defining expertise
- Context-aware recommendations based on environment analysis
- Multi-turn conversations with history tracking
- Structured recommendation flow: environment → experience → preferences → recommendations

**Recommendation Pipeline**:
1. Gather user environment data (indoor/outdoor, light, humidity, space)
2. Assess plant care experience level
3. Identify style preferences (foliage, succulents, herbs, flowers, air-purifying)
4. Provide 3-5 specific plant recommendations with care instructions and pricing
5. Direct users to simgo.kr shop or simda.me marketplace

### Design System

**Color Palette**:
- Primary: Natural botanical green (hsl(142, 76%, 36%))
- Accent variations for backgrounds and overlays
- Neutral grays for text hierarchy
- Warm terracotta for CTAs, soft blue for information

**Typography**:
- Primary: Pretendard (Korean) / Inter (Latin)
- Generous line heights (1.7 body, 1.2 headings)
- Responsive sizing with mobile-first breakpoints

**Layout Patterns**:
- Container max-widths: 7xl for full-width, 6xl for content, 3xl for text
- Consistent spacing scale (4, 8, 12, 16, 24, 32)
- Grid systems for services (4-col), portfolio (3-col), magazine (3-col)

**Design Philosophy**: Reference-based premium plant lifestyle combining The Sill's botanical elegance, Airbnb's trust-building, and Linear's refined minimalism with Korean optimization

## External Dependencies

### Third-Party Services

1. **Google Gemini AI** (via Replit AI Integrations)
   - Purpose: AI-powered plant curation and conversational recommendations
   - Integration: @google/genai SDK with Replit proxy
   - Environment: AI_INTEGRATIONS_GEMINI_API_KEY, AI_INTEGRATIONS_GEMINI_BASE_URL

2. **Neon Database** (PostgreSQL)
   - Purpose: Serverless PostgreSQL database
   - Integration: @neondatabase/serverless with WebSocket support
   - Environment: DATABASE_URL

3. **External Platforms**:
   - simgo.kr: Direct plant purchase e-commerce platform
   - simda.me: Regional marketplace for competitive bidding on plants

### UI Component Libraries

- **Radix UI**: Unstyled, accessible component primitives
  - Accordion, Dialog, Dropdown, Popover, Select, Tabs, Toast, Calendar
  - Form controls: Checkbox, Radio, Switch, Slider
  - Navigation: Navigation Menu, Context Menu, Menubar
  
- **shadcn/ui**: Pre-styled Radix components with Tailwind CSS

### Development Tools

- **Vite**: Build tool and development server
  - HMR, asset bundling, TypeScript compilation
  - Replit-specific plugins: runtime-error-modal, cartographer, dev-banner

- **TypeScript**: Type safety across frontend and backend
  - Path aliases: @/* for client, @shared/* for shared types

### Utility Libraries

- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state and validation
- **Zod**: Runtime schema validation
- **date-fns**: Date formatting and manipulation (Korean locale)
- **Wouter**: Lightweight client-side routing
- **class-variance-authority**: Component variant management
- **tailwind-merge**: Conditional Tailwind class merging

### Build and Production

- **esbuild**: Production backend bundling
- **PostCSS**: CSS processing with Tailwind and Autoprefixer
- **tsx**: TypeScript execution for development server