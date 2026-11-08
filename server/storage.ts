import type {
  SiteText,
  InsertSiteText,
  SiteTextChange,
  SiteImage,
  InsertSiteImage,
  ChatHistory,
  InsertChatHistory,
  Booking,
  InsertBooking,
  B2bProposal,
  InsertB2bProposal,
  Portfolio,
  InsertPortfolio,
  Post,
  InsertPost,
  Comment,
  InsertComment,
  Timeline,
  InsertTimeline,
  Document,
  InsertDocument,
  User,
  UpsertUser,
} from "@shared/schema";
import { db } from "./db";
import * as schema from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

// Memory records retain their existing omitted fields; DB rows remain strict.
// These aliases affect types only and do not normalize or mutate stored values.
type MemoryBooking = Omit<Booking, "aiRecommendation"> & Partial<Pick<Booking, "aiRecommendation">>;
type MemoryProposal = Omit<B2bProposal, "businessField" | "attachmentUrl"> & Partial<Pick<B2bProposal, "businessField" | "attachmentUrl">>;
type MemoryPortfolio = Omit<Portfolio, "clientName" | "completedDate" | "featured"> & Partial<Pick<Portfolio, "clientName" | "completedDate" | "featured">>;
type MemoryPost = Omit<Post, "author" | "published" | "publishedAt"> & Partial<Pick<Post, "author" | "published" | "publishedAt">>;
type MemoryDocument = Omit<Document, "updatedAt"> & Partial<Pick<Document, "updatedAt">>;

export interface IStorage<StoredBooking = Booking, StoredProposal = B2bProposal, StoredPortfolio = Portfolio, StoredPost = Post, StoredDocument = Document> {
  getSiteTexts(): Promise<SiteText[]>;
  upsertSiteText(data: InsertSiteText): Promise<SiteText>;
  deleteSiteText(key: string): Promise<void>;
  applySiteTextChanges(changes: SiteTextChange[]): Promise<void>;
  getSiteImages(): Promise<SiteImage[]>;
  upsertSiteImage(data: InsertSiteImage): Promise<SiteImage>;
  deleteSiteImage(key: string): Promise<void>;
  // Chat histories
  createChatHistory(data: InsertChatHistory): Promise<ChatHistory>;
  getChatHistoriesBySession(sessionId: string): Promise<ChatHistory[]>;

  // Bookings
  createBooking(data: InsertBooking): Promise<StoredBooking>;
  getAllBookings(): Promise<StoredBooking[]>;
  getBookingById(id: string): Promise<StoredBooking | undefined>;
  updateBookingStatus(id: string, status: string): Promise<StoredBooking | undefined>;

  // B2B proposals
  createB2bProposal(data: InsertB2bProposal): Promise<StoredProposal>;
  getAllB2bProposals(): Promise<StoredProposal[]>;
  getB2bProposalById(id: string): Promise<StoredProposal | undefined>;
  updateB2bProposalStatus(id: string, status: string): Promise<StoredProposal | undefined>;

  // Portfolios
  createPortfolio(data: InsertPortfolio): Promise<StoredPortfolio>;
  getAllPortfolios(): Promise<StoredPortfolio[]>;
  getPortfolioById(id: string): Promise<StoredPortfolio | undefined>;
  updatePortfolio(id: string, data: Partial<InsertPortfolio>): Promise<StoredPortfolio | undefined>;
  deletePortfolio(id: string): Promise<void>;

  // Posts
  createPost(data: InsertPost): Promise<StoredPost>;
  getAllPosts(): Promise<StoredPost[]>;
  getPostById(id: string): Promise<StoredPost | undefined>;
  updatePost(id: string, data: Partial<InsertPost>): Promise<StoredPost | undefined>;
  deletePost(id: string): Promise<void>;
  incrementPostViewCount(id: string): Promise<void>;

  // Comments
  createComment(data: InsertComment): Promise<Comment>;
  getCommentsByPostId(postId: string): Promise<Comment[]>;
  approveComment(id: string): Promise<Comment | undefined>;
  deleteComment(id: string): Promise<void>;

  // Timelines
  createTimeline(data: InsertTimeline): Promise<Timeline>;
  getAllTimelines(): Promise<Timeline[]>;
  getTimelineById(id: string): Promise<Timeline | undefined>;
  updateTimeline(id: string, data: Partial<InsertTimeline>): Promise<Timeline | undefined>;
  deleteTimeline(id: string): Promise<void>;

  // Documents
  createDocument(data: InsertDocument): Promise<StoredDocument>;
  getAllDocuments(): Promise<StoredDocument[]>;
  getDocumentById(id: string): Promise<StoredDocument | undefined>;
  deleteDocument(id: string): Promise<void>;

  // Users (Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
}

// In-memory storage implementation
export class MemStorage implements IStorage<MemoryBooking, MemoryProposal, MemoryPortfolio, MemoryPost, MemoryDocument> {
  private siteTexts = new Map<string, SiteText>();

  async getSiteTexts(): Promise<SiteText[]> {
    return Array.from(this.siteTexts.values());
  }

  async upsertSiteText(data: InsertSiteText): Promise<SiteText> {
    const text: SiteText = { ...data, updatedAt: new Date() };
    this.siteTexts.set(data.key, text);
    return text;
  }

  async deleteSiteText(key: string): Promise<void> {
    this.siteTexts.delete(key);
  }

  async applySiteTextChanges(changes: SiteTextChange[]): Promise<void> {
    const next = new Map(this.siteTexts);
    for (const { key, value } of changes) {
      if (value === null) next.delete(key);
      else next.set(key, { key, value, updatedAt: new Date() });
    }
    this.siteTexts = next;
  }

  private siteImages = new Map<string, SiteImage>();

  async getSiteImages(): Promise<SiteImage[]> {
    return Array.from(this.siteImages.values());
  }

  async upsertSiteImage(data: InsertSiteImage): Promise<SiteImage> {
    const image: SiteImage = { ...data, alt: data.alt ?? null, updatedAt: new Date() };
    this.siteImages.set(data.key, image);
    return image;
  }

  async deleteSiteImage(key: string): Promise<void> {
    this.siteImages.delete(key);
  }

  private chatHistories: Map<string, ChatHistory> = new Map();
  private bookings: Map<string, MemoryBooking> = new Map();
  private b2bProposals: Map<string, MemoryProposal> = new Map();
  private portfolios: Map<string, MemoryPortfolio> = new Map();
  private posts: Map<string, MemoryPost> = new Map();
  private timelines: Map<string, Timeline> = new Map();
  private documents: Map<string, MemoryDocument> = new Map();

  constructor() {
    // Seed with sample data
    this.seedData();
  }

  private seedData() {
    // Sample portfolios
    const samplePortfolios: MemoryPortfolio[] = [
      {
        id: "port-1",
        title: "강남 오피스 그린 인테리어",
        description: "500평 규모의 IT 기업 사무실 전체 식물 디자인 및 관리 프로젝트",
        category: "Office",
        clientName: "테크컴퍼니",
        completedDate: new Date("2024-03-15"),
        thumbnailUrl: "/images/office_plants_worksp_feec8201.jpg",
        images: [
          "/images/office_plants_worksp_feec8201.jpg",
          "/images/office_plants_worksp_27158d8c.jpg",
        ],
        featured: true,
        createdAt: new Date("2024-03-15"),
        updatedAt: new Date("2024-03-15"),
      },
      {
        id: "port-2",
        title: "한남동 레지던스 베란다 가든",
        description: "30평 베란다를 활용한 프라이빗 가든 조성",
        category: "Residential",
        clientName: "김OO",
        completedDate: new Date("2024-02-20"),
        thumbnailUrl: "/images/indoor_green_plants_39713ed5.jpg",
        images: [
          "/images/indoor_green_plants_39713ed5.jpg",
          "/images/indoor_green_plants_6888f986.jpg",
        ],
        featured: false,
        createdAt: new Date("2024-02-20"),
        updatedAt: new Date("2024-02-20"),
      },
      {
        id: "port-3",
        title: "압구정 카페 식물 큐레이션",
        description: "북유럽 감성의 카페 전체 식물 디스플레이 및 관리",
        category: "Commercial",
        clientName: "그린카페",
        completedDate: new Date("2024-01-10"),
        thumbnailUrl: "/images/indoor_green_plants_353a10db.jpg",
        images: [
          "/images/indoor_green_plants_353a10db.jpg",
          "/images/indoor_green_plants_26d41307.jpg",
        ],
        featured: true,
        createdAt: new Date("2024-01-10"),
        updatedAt: new Date("2024-01-10"),
      },
    ];

    samplePortfolios.forEach((p) => this.portfolios.set(p.id, p));

    // Sample posts
    const samplePosts: MemoryPost[] = [
      {
        id: "post-1",
        title: "초보자를 위한 겨울철 식물 관리 가이드",
        content: "# 겨울철 식물 관리의 모든 것\n\n난방으로 인한 건조함, 부족한 일조량... 겨울은 식물에게 힘든 계절입니다.",
        excerpt: "난방으로 건조해진 실내에서 식물을 건강하게 유지하는 방법을 알려드립니다.",
        thumbnailUrl: "/images/plant_care_gardening_81fc1151.jpg",
        category: "Plant Care",
        tags: ["겨울", "관리", "초보"],
        author: "simda Team",
        viewCount: 1245,
        published: true,
        createdAt: new Date("2024-11-01"),
        updatedAt: new Date("2024-11-01"),
      },
      {
        id: "post-2",
        title: "2024년 인기 트렌드 식물 TOP 5",
        content: "# 올해 가장 핫한 식물들\n\n소셜 미디어를 뜨겁게 달군 식물들을 소개합니다.",
        excerpt: "올해 가장 많은 사랑을 받은 트렌디한 식물 5종을 소개합니다.",
        thumbnailUrl: "/images/indoor_green_plants_25a99439.jpg",
        category: "Trends",
        tags: ["트렌드", "인기", "추천"],
        author: "김수민",
        viewCount: 2341,
        published: true,
        createdAt: new Date("2024-10-20"),
        updatedAt: new Date("2024-10-20"),
      },
      {
        id: "post-3",
        title: "우리 집 공기를 정화하는 식물 베스트 10",
        content: "# 공기정화 식물 가이드\n\nNASA 연구 결과를 바탕으로 선정한 공기정화 식물을 소개합니다.",
        excerpt: "NASA가 인정한 공기정화 능력이 뛰어난 식물들을 만나보세요.",
        thumbnailUrl: "/images/plant_care_gardening_de5a8760.jpg",
        category: "Interior",
        tags: ["공기정화", "건강", "인테리어"],
        author: "박민준",
        viewCount: 3512,
        published: true,
        createdAt: new Date("2024-10-05"),
        updatedAt: new Date("2024-10-05"),
      },
    ];

    samplePosts.forEach((p) => this.posts.set(p.id, p));
  }

  // Chat histories
  async createChatHistory(data: InsertChatHistory): Promise<ChatHistory> {
    const id = `chat-${Date.now()}-${Math.random()}`;
    const chatHistory: ChatHistory = {
      id,
      ...data,
      createdAt: new Date(),
    };
    this.chatHistories.set(id, chatHistory);
    return chatHistory;
  }

  async getChatHistoriesBySession(sessionId: string): Promise<ChatHistory[]> {
    return Array.from(this.chatHistories.values())
      .filter((ch) => ch.sessionId === sessionId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  // Bookings
  async createBooking(data: InsertBooking): Promise<MemoryBooking> {
    const id = `book-${Date.now()}-${Math.random()}`;
    const booking: MemoryBooking = {
      id,
      ...data,
      status: "pending",
      createdAt: new Date(),
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async getAllBookings(): Promise<MemoryBooking[]> {
    return Array.from(this.bookings.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getBookingById(id: string): Promise<MemoryBooking | undefined> {
    return this.bookings.get(id);
  }

  async updateBookingStatus(id: string, status: string): Promise<MemoryBooking | undefined> {
    const booking = this.bookings.get(id);
    if (booking) {
      booking.status = status;
      this.bookings.set(id, booking);
      return booking;
    }
    return undefined;
  }

  // B2B proposals
  async createB2bProposal(data: InsertB2bProposal): Promise<MemoryProposal> {
    const id = `b2b-${Date.now()}-${Math.random()}`;
    const proposal: MemoryProposal = {
      id,
      ...data,
      status: "pending",
      createdAt: new Date(),
    };
    this.b2bProposals.set(id, proposal);
    return proposal;
  }

  async getAllB2bProposals(): Promise<MemoryProposal[]> {
    return Array.from(this.b2bProposals.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getB2bProposalById(id: string): Promise<MemoryProposal | undefined> {
    return this.b2bProposals.get(id);
  }

  async updateB2bProposalStatus(id: string, status: string): Promise<MemoryProposal | undefined> {
    const proposal = this.b2bProposals.get(id);
    if (proposal) {
      proposal.status = status;
      this.b2bProposals.set(id, proposal);
      return proposal;
    }
    return undefined;
  }

  // Portfolios
  async createPortfolio(data: InsertPortfolio): Promise<MemoryPortfolio> {
    const id = `port-${Date.now()}-${Math.random()}`;
    const portfolio: MemoryPortfolio = {
      id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.portfolios.set(id, portfolio);
    return portfolio;
  }

  async getAllPortfolios(): Promise<MemoryPortfolio[]> {
    return Array.from(this.portfolios.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getPortfolioById(id: string): Promise<MemoryPortfolio | undefined> {
    return this.portfolios.get(id);
  }

  async updatePortfolio(id: string, data: Partial<InsertPortfolio>): Promise<MemoryPortfolio | undefined> {
    const portfolio = this.portfolios.get(id);
    if (portfolio) {
      const updated = { ...portfolio, ...data, updatedAt: new Date() };
      this.portfolios.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async deletePortfolio(id: string): Promise<void> {
    this.portfolios.delete(id);
  }

  // Posts
  async createPost(data: InsertPost): Promise<MemoryPost> {
    const id = `post-${Date.now()}-${Math.random()}`;
    const post: MemoryPost = {
      id,
      ...data,
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.posts.set(id, post);
    return post;
  }

  async getAllPosts(): Promise<MemoryPost[]> {
    return Array.from(this.posts.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getPostById(id: string): Promise<MemoryPost | undefined> {
    return this.posts.get(id);
  }

  async updatePost(id: string, data: Partial<InsertPost>): Promise<MemoryPost | undefined> {
    const post = this.posts.get(id);
    if (post) {
      const updated = { ...post, ...data, updatedAt: new Date() };
      this.posts.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async deletePost(id: string): Promise<void> {
    this.posts.delete(id);
  }

  async incrementPostViewCount(id: string): Promise<void> {
    const post = this.posts.get(id);
    if (post) {
      post.viewCount++;
      this.posts.set(id, post);
    }
  }

  // Comments (stub for MemStorage - not persisted)
  async createComment(data: InsertComment): Promise<Comment> {
    const id = `comment-${Date.now()}`;
    const comment: Comment = {
      id,
      ...data,
      approved: false,
      createdAt: new Date(),
    };
    return comment;
  }

  async getCommentsByPostId(postId: string): Promise<Comment[]> {
    return [];
  }

  async approveComment(id: string): Promise<Comment | undefined> {
    return undefined;
  }

  async deleteComment(id: string): Promise<void> {
    // No-op for MemStorage
  }

  // Timelines
  async createTimeline(data: InsertTimeline): Promise<Timeline> {
    const id = `time-${Date.now()}-${Math.random()}`;
    const timeline: Timeline = {
      id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.timelines.set(id, timeline);
    return timeline;
  }

  async getAllTimelines(): Promise<Timeline[]> {
    return Array.from(this.timelines.values()).sort((a, b) => {
      const yearA = parseInt(a.year);
      const yearB = parseInt(b.year);
      return yearB - yearA;
    });
  }

  async getTimelineById(id: string): Promise<Timeline | undefined> {
    return this.timelines.get(id);
  }

  async updateTimeline(id: string, data: Partial<InsertTimeline>): Promise<Timeline | undefined> {
    const timeline = this.timelines.get(id);
    if (timeline) {
      const updated = { ...timeline, ...data, updatedAt: new Date() };
      this.timelines.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async deleteTimeline(id: string): Promise<void> {
    this.timelines.delete(id);
  }

  // Documents
  async createDocument(data: InsertDocument): Promise<MemoryDocument> {
    const id = `doc-${Date.now()}-${Math.random()}`;
    const document: MemoryDocument = {
      id,
      ...data,
      createdAt: new Date(),
    };
    this.documents.set(id, document);
    return document;
  }

  async getAllDocuments(): Promise<MemoryDocument[]> {
    return Array.from(this.documents.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getDocumentById(id: string): Promise<MemoryDocument | undefined> {
    return this.documents.get(id);
  }

  async deleteDocument(id: string): Promise<void> {
    this.documents.delete(id);
  }

  async getUser(id: string): Promise<User | undefined> {
    return undefined;
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    return {
      ...user,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;
  }
}

// Database storage implementation using Drizzle ORM
export class DbStorage implements IStorage {
  async getSiteTexts(): Promise<SiteText[]> {
    return db.select().from(schema.siteTexts);
  }

  async upsertSiteText(data: InsertSiteText): Promise<SiteText> {
    const values = { ...data, updatedAt: new Date() };
    const [text] = await db.insert(schema.siteTexts).values(values).onConflictDoUpdate({
      target: schema.siteTexts.key,
      set: { value: values.value, updatedAt: values.updatedAt },
    }).returning();
    return text;
  }

  async deleteSiteText(key: string): Promise<void> {
    await db.delete(schema.siteTexts).where(eq(schema.siteTexts.key, key));
  }

  async applySiteTextChanges(changes: SiteTextChange[]): Promise<void> {
    await db.transaction(async tx => {
      for (const { key, value } of changes) {
        if (value === null) await tx.delete(schema.siteTexts).where(eq(schema.siteTexts.key, key));
        else await tx.insert(schema.siteTexts).values({ key, value, updatedAt: new Date() }).onConflictDoUpdate({
          target: schema.siteTexts.key,
          set: { value, updatedAt: new Date() },
        });
      }
    });
  }

  async getSiteImages(): Promise<SiteImage[]> {
    return db.select().from(schema.siteImages);
  }

  async upsertSiteImage(data: InsertSiteImage): Promise<SiteImage> {
    const values = { ...data, alt: data.alt ?? null, updatedAt: new Date() };
    const [image] = await db.insert(schema.siteImages).values(values).onConflictDoUpdate({
      target: schema.siteImages.key,
      set: { url: values.url, alt: values.alt, updatedAt: values.updatedAt },
    }).returning();
    return image;
  }

  async deleteSiteImage(key: string): Promise<void> {
    await db.delete(schema.siteImages).where(eq(schema.siteImages.key, key));
  }

  // Chat histories
  async createChatHistory(data: InsertChatHistory): Promise<ChatHistory> {
    const [result] = await db.insert(schema.chatHistories).values(data).returning();
    return result;
  }

  async getChatHistoriesBySession(sessionId: string): Promise<ChatHistory[]> {
    return await db.query.chatHistories.findMany({
      where: eq(schema.chatHistories.sessionId, sessionId),
      orderBy: [desc(schema.chatHistories.createdAt)],
    });
  }

  // Bookings
  async createBooking(data: InsertBooking): Promise<Booking> {
    const [result] = await db.insert(schema.bookings).values(data).returning();
    return result;
  }

  async getAllBookings(): Promise<Booking[]> {
    const result = await db.query.bookings.findMany({
      orderBy: [desc(schema.bookings.createdAt)],
    });
    console.log("[DbStorage] getAllBookings result count:", result.length);
    return result;
  }

  async getBookingById(id: string): Promise<Booking | undefined> {
    return await db.query.bookings.findFirst({
      where: eq(schema.bookings.id, id),
    });
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking | undefined> {
    const [result] = await db
      .update(schema.bookings)
      .set({ status })
      .where(eq(schema.bookings.id, id))
      .returning();
    return result;
  }

  // B2B proposals
  async createB2bProposal(data: InsertB2bProposal): Promise<B2bProposal> {
    const [result] = await db.insert(schema.b2bProposals).values(data).returning();
    return result;
  }

  async getAllB2bProposals(): Promise<B2bProposal[]> {
    const result = await db.query.b2bProposals.findMany({
      orderBy: [desc(schema.b2bProposals.createdAt)],
    });
    console.log("[DbStorage] getAllB2bProposals result count:", result.length);
    return result;
  }

  async getB2bProposalById(id: string): Promise<B2bProposal | undefined> {
    return await db.query.b2bProposals.findFirst({
      where: eq(schema.b2bProposals.id, id),
    });
  }

  async updateB2bProposalStatus(id: string, status: string): Promise<B2bProposal | undefined> {
    const [result] = await db
      .update(schema.b2bProposals)
      .set({ status })
      .where(eq(schema.b2bProposals.id, id))
      .returning();
    return result;
  }

  // Portfolios
  async createPortfolio(data: InsertPortfolio): Promise<Portfolio> {
    const [result] = await db.insert(schema.portfolios).values(data).returning();
    return result;
  }

  async getAllPortfolios(): Promise<Portfolio[]> {
    const result = await db.query.portfolios.findMany({
      orderBy: [desc(schema.portfolios.createdAt)],
    });
    console.log("[DbStorage] getAllPortfolios result count:", result.length);
    return result;
  }

  async getPortfolioById(id: string): Promise<Portfolio | undefined> {
    return await db.query.portfolios.findFirst({
      where: eq(schema.portfolios.id, id),
    });
  }

  async updatePortfolio(id: string, data: Partial<InsertPortfolio>): Promise<Portfolio | undefined> {
    const [result] = await db
      .update(schema.portfolios)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.portfolios.id, id))
      .returning();
    return result;
  }

  async deletePortfolio(id: string): Promise<void> {
    await db.delete(schema.portfolios).where(eq(schema.portfolios.id, id));
  }

  // Posts
  async createPost(data: InsertPost): Promise<Post> {
    const [result] = await db.insert(schema.posts).values(data).returning();
    return result;
  }

  async getAllPosts(): Promise<Post[]> {
    const result = await db.query.posts.findMany({
      orderBy: [desc(schema.posts.createdAt)],
    });
    console.log("[DbStorage] getAllPosts result count:", result.length);
    return result;
  }

  async getPostById(id: string): Promise<Post | undefined> {
    return await db.query.posts.findFirst({
      where: eq(schema.posts.id, id),
    });
  }

  async updatePost(id: string, data: Partial<InsertPost>): Promise<Post | undefined> {
    const [result] = await db
      .update(schema.posts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.posts.id, id))
      .returning();
    return result;
  }

  async deletePost(id: string): Promise<void> {
    await db.delete(schema.posts).where(eq(schema.posts.id, id));
  }

  async incrementPostViewCount(id: string): Promise<void> {
    const post = await this.getPostById(id);
    if (post) {
      await db
        .update(schema.posts)
        .set({ viewCount: post.viewCount + 1 })
        .where(eq(schema.posts.id, id));
    }
  }

  // Comments
  async createComment(data: InsertComment): Promise<Comment> {
    const [result] = await db.insert(schema.comments).values(data).returning();
    return result;
  }

  async getCommentsByPostId(postId: string): Promise<Comment[]> {
    return await db.query.comments.findMany({
      where: and(
        eq(schema.comments.postId, postId),
        eq(schema.comments.approved, true)
      ),
      orderBy: [desc(schema.comments.createdAt)],
    });
  }

  async approveComment(id: string): Promise<Comment | undefined> {
    const [result] = await db
      .update(schema.comments)
      .set({ approved: true })
      .where(eq(schema.comments.id, id))
      .returning();
    return result;
  }

  async deleteComment(id: string): Promise<void> {
    await db.delete(schema.comments).where(eq(schema.comments.id, id));
  }

  // Timelines
  async createTimeline(data: InsertTimeline): Promise<Timeline> {
    const [result] = await db.insert(schema.timelines).values(data).returning();
    return result;
  }

  async getAllTimelines(): Promise<Timeline[]> {
    const timelines = await db.query.timelines.findMany();
    // Sort by year (numerically, with latest first)
    return timelines.sort((a, b) => {
      const yearA = parseInt(a.year);
      const yearB = parseInt(b.year);
      return yearB - yearA;
    });
  }

  async getTimelineById(id: string): Promise<Timeline | undefined> {
    return await db.query.timelines.findFirst({
      where: eq(schema.timelines.id, id),
    });
  }

  async updateTimeline(id: string, data: Partial<InsertTimeline>): Promise<Timeline | undefined> {
    const [result] = await db
      .update(schema.timelines)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.timelines.id, id))
      .returning();
    return result;
  }

  async deleteTimeline(id: string): Promise<void> {
    await db.delete(schema.timelines).where(eq(schema.timelines.id, id));
  }

  // Documents
  async createDocument(data: InsertDocument): Promise<Document> {
    const [result] = await db.insert(schema.documents).values(data).returning();
    return result;
  }

  async getAllDocuments(): Promise<Document[]> {
    return await db.query.documents.findMany({
      orderBy: [desc(schema.documents.createdAt)],
    });
  }

  async getDocumentById(id: string): Promise<Document | undefined> {
    return await db.query.documents.findFirst({
      where: eq(schema.documents.id, id),
    });
  }

  async deleteDocument(id: string): Promise<void> {
    await db.delete(schema.documents).where(eq(schema.documents.id, id));
  }

  // Users (Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    return await db.query.users.findFirst({
      where: eq(schema.users.id, id),
    });
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(schema.users)
      .values(userData)
      .onConflictDoUpdate({
        target: schema.users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
}

export const storage = new DbStorage();
