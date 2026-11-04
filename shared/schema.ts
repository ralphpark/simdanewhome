import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat histories table for AI plant curation conversations
export const chatHistories = pgTable("chat_histories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  userMessage: text("user_message").notNull(),
  aiResponse: text("ai_response").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Bookings table for consultation appointments
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  consultationType: text("consultation_type").notNull(), // AI curation, subscription, education, B2B, other
  preferredDate: timestamp("preferred_date").notNull(),
  preferredTime: text("preferred_time").notNull(),
  message: text("message").notNull(),
  status: text("status").default("pending").notNull(), // pending, confirmed, completed, cancelled
  aiRecommendation: text("ai_recommendation"), // Optional - from AI chatbot
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// B2B proposals table for corporate collaboration
export const b2bProposals = pgTable("b2b_proposals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  businessField: text("business_field"),
  proposalContent: text("proposal_content").notNull(),
  attachmentUrl: text("attachment_url"), // Object storage path
  status: text("status").default("pending").notNull(), // pending, reviewing, accepted, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Portfolio projects table
export const portfolios = pgTable("portfolios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // indoor, outdoor, office, residential, etc.
  clientName: text("client_name"),
  completedDate: timestamp("completed_date"),
  thumbnailUrl: text("thumbnail_url").notNull(), // Object storage path
  images: text("images").array().notNull(), // Array of object storage paths
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Magazine/blog posts table
export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(), // Markdown content
  excerpt: text("excerpt").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(), // Object storage path
  category: text("category").notNull(), // plant care, project story, trends, interior, etc.
  tags: text("tags").array().notNull(),
  author: text("author").default("simda Team").notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  published: boolean("published").default(true).notNull(),
  publishedAt: timestamp("published_at"), // For scheduled publishing
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Comments table for blog posts
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  authorName: text("author_name").notNull(),
  authorEmail: text("author_email").notNull(),
  content: text("content").notNull(),
  approved: boolean("approved").default(false).notNull(), // Moderation flag
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Company timeline table
export const timelines = pgTable("timelines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  year: varchar("year").notNull(), // e.g., "2017", "2019"
  title: text("title").notNull(), // Event title
  description: text("description").notNull(), // Event description
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Documents table for company introduction and proposal templates
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // Document name (e.g., "회사소개서 2024", "제안서 양식")
  type: text("type").notNull(), // "company-intro" or "proposal-template"
  fileUrl: text("file_url").notNull(), // Object storage path
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Public site image overrides. Defaults stay in client/src/content/images.ts.
export const siteImages = pgTable("site_images", {
  key: varchar("key").primaryKey(),
  url: text("url").notNull(),
  alt: text("alt"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSiteImageSchema = createInsertSchema(siteImages).omit({ updatedAt: true }).extend({
  url: z.string().url().refine((value) => {
    try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; }
    catch { return false; }
  }, "이미지 URL은 HTTPS 주소여야 합니다"),
  alt: z.string().max(1000).nullable().optional(),
});
export type SiteImage = typeof siteImages.$inferSelect;
export type InsertSiteImage = z.infer<typeof insertSiteImageSchema>;

// Insert schemas
export const insertChatHistorySchema = createInsertSchema(chatHistories).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  status: true,
  createdAt: true,
}).extend({
  email: z.string().email("유효한 이메일 주소를 입력해주세요"),
  phone: z.string().min(10, "유효한 전화번호를 입력해주세요"),
  name: z.string().min(2, "이름을 입력해주세요"),
  message: z.string().min(0, "최소 1자 이상 입력해주세요"),
  preferredDate: z.coerce.date(),
});

export const insertB2bProposalSchema = createInsertSchema(b2bProposals).omit({
  id: true,
  status: true,
  createdAt: true,
}).extend({
  email: z.string().email("유효한 이메일 주소를 입력해주세요"),
  phone: z.string().min(10, "유효한 전화번호를 입력해주세요"),
  companyName: z.string().min(2, "회사명을 입력해주세요"),
  contactName: z.string().min(2, "담당자명을 입력해주세요"),
  proposalContent: z.string().min(20, "제안 내용을 입력해주세요"),
});

export const insertPortfolioSchema = createInsertSchema(portfolios).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  publishedAt: z.date().optional().nullable(),
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  approved: true,
  createdAt: true,
}).extend({
  authorName: z.string().min(2, "이름을 입력해주세요"),
  authorEmail: z.string().email("유효한 이메일 주소를 입력해주세요"),
  content: z.string().min(10, "댓글은 최소 10자 이상 입력해주세요"),
});

export const insertTimelineSchema = createInsertSchema(timelines).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  year: z.string().regex(/^\d{4}$/, "연도는 4자리 숫자만 입력 가능합니다"),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  name: z.string().min(2, "문서명을 입력해주세요"),
  type: z.enum(["company-intro", "proposal-template"]),
  fileUrl: z.string().url("유효한 파일 URL을 입력해주세요"),
});

// Types
export type ChatHistory = typeof chatHistories.$inferSelect;
export type InsertChatHistory = z.infer<typeof insertChatHistorySchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type B2bProposal = typeof b2bProposals.$inferSelect;
export type InsertB2bProposal = z.infer<typeof insertB2bProposalSchema>;

export type Portfolio = typeof portfolios.$inferSelect;
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Timeline = typeof timelines.$inferSelect;
export type InsertTimeline = z.infer<typeof insertTimelineSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
