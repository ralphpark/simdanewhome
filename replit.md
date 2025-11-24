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
- Bookings: POST/GET `/api/bookings` with status updates and email notifications
- B2B Proposals: POST/GET `/api/b2b-proposals` with status management and email notifications
- Portfolios: Full CRUD operations
- Posts: Full CRUD with view count tracking
- Comments: POST/GET/PATCH/DELETE `/api/posts/:postId/comments` with approval workflow
- SEO: GET `/sitemap.xml` for dynamic sitemap generation

**Storage Layer**:
- Interface-based storage abstraction (IStorage)
- **Production**: DbStorage implementation using PostgreSQL database (actively used)
- **Fallback**: MemStorage implementation for development (legacy)

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
   - Email notifications sent on creation

3. **b2b_proposals**: Corporate partnership requests
   - Company details, proposal content, attachment URLs
   - Status workflow (pending → reviewing → accepted/rejected)
   - Email notifications sent on submission

4. **portfolios**: Project showcase
   - Title, description, category, client, location
   - Image URLs, completion date, tags, featured flag

5. **posts**: Magazine/blog content
   - Title, content, excerpt, category, author
   - Featured image, tags, published status, view count

6. **comments**: User comments on blog posts
   - Author name, email, content, postId reference
   - Approval workflow (approved field defaults to false)
   - Only approved comments displayed publicly

**Schema Validation**: Zod schemas generated from Drizzle schema using drizzle-zod for runtime validation

**Database Seeding**: Initial sample data populated via `server/seed.ts` (run with `npm run db:seed`)

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

3. **Nodemailer** (Email Service)
   - Purpose: Sending transactional emails for bookings and B2B proposals
   - Integration: Gmail SMTP transport
   - Environment: EMAIL_USER, EMAIL_PASS
   - Email types: Booking confirmations, B2B proposal notifications

4. **ChannelTalk** (Live Chat)
   - Purpose: Real-time customer support and engagement
   - Integration: ChannelTalk SDK loaded via script tag
   - Environment: VITE_CHANNELTALK_PLUGIN_KEY
   - Features: Live chat widget, automated responses, conversation history

5. **External Platforms**:
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
- **Nodemailer**: Email sending service for transactional notifications

### Build and Production

- **esbuild**: Production backend bundling
- **PostCSS**: CSS processing with Tailwind and Autoprefixer
- **tsx**: TypeScript execution for development server

## Recent Updates (November 24, 2025)

### Phase 2: Database Persistence & Communication Features

1. **Database Migration to PostgreSQL**
   - Migrated from MemStorage to DbStorage using Drizzle ORM
   - All data now persisted in Neon PostgreSQL database
   - Created seed script (`server/seed.ts`) with sample portfolios and posts
   - Database push workflow: `npm run db:push` and `npm run db:seed`

2. **Email Notification System**
   - Implemented Nodemailer with Gmail SMTP transport (`server/email.ts`)
   - Booking confirmation emails sent to users upon consultation booking
   - B2B proposal notification emails sent to admin upon submission
   - HTML email templates with SIMDA branding and details
   - Environment variables: EMAIL_USER, EMAIL_PASS

3. **ChannelTalk Live Chat Integration**
   - Integrated ChannelTalk SDK for real-time customer support
   - Chat widget available across all pages
   - Plugin key stored in VITE_CHANNELTALK_PLUGIN_KEY environment variable
   - Automatic user tracking and conversation history

4. **Comments System for Magazine Posts**
   - Added comments schema with approval workflow
   - Comments require admin approval before being displayed publicly
   - API endpoints: POST/GET comments, PATCH approve, DELETE remove
   - Comments displayed with author name, timestamp, and content
   - Frontend UI ready for implementation

5. **SEO Optimization with Dynamic Sitemap**
   - Dynamic sitemap.xml generation at `/sitemap.xml`
   - Automatically includes all published posts and portfolios
   - Proper priority and changefreq settings for each page type
   - Updates in real-time as content is added/removed

### Phase 3: Admin Features & Advanced Capabilities (November 24, 2025)

1. **Replit Auth Integration**
   - Complete admin authentication system using Replit OpenID Connect
   - Session management with PostgreSQL store
   - Protected admin routes requiring authentication (`isAuthenticated` middleware)
   - Auth endpoints: `/api/login`, `/api/logout`, `/api/callback`, `/api/auth/user`
   - User profile storage in users table with profile information

2. **Post Scheduling System**
   - Added `publishedAt` timestamp field to posts schema
   - Admin API endpoint: `PATCH /api/admin/posts/:id/schedule` for scheduling posts
   - Posts can be drafted and scheduled for future publication
   - Supports both immediate and future publishing

3. **Image Upload Infrastructure**
   - Object Storage already configured and ready for use
   - Protected upload endpoint: `POST /api/upload` (requires authentication)
   - Supports portfolio and post image uploads
   - Images stored in object storage with URLs in database records

4. **Admin API Endpoints**
   - `GET /api/admin/posts` - Fetch all posts for management (protected)
   - `GET /api/admin/comments` - Fetch all comments across posts (protected)
   - `PATCH /api/admin/posts/:id/schedule` - Schedule posts for publication (protected)
   - `POST /api/upload` - Upload images to object storage (protected)

### Deferred Features (Future Enhancements)

- **Admin Dashboard UI**: Complete frontend admin dashboard for managing content
- **Advanced Image Processing**: Image optimization, cropping, and thumbnail generation
- **Post Drafts**: Save posts as drafts before publishing
- **Role-Based Access Control**: Different permission levels for admin users