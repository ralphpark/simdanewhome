import type {
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
} from "@shared/schema";

export interface IStorage {
  // Chat histories
  createChatHistory(data: InsertChatHistory): Promise<ChatHistory>;
  getChatHistoriesBySession(sessionId: string): Promise<ChatHistory[]>;

  // Bookings
  createBooking(data: InsertBooking): Promise<Booking>;
  getAllBookings(): Promise<Booking[]>;
  getBookingById(id: string): Promise<Booking | undefined>;
  updateBookingStatus(id: string, status: string): Promise<Booking | undefined>;

  // B2B proposals
  createB2bProposal(data: InsertB2bProposal): Promise<B2bProposal>;
  getAllB2bProposals(): Promise<B2bProposal[]>;
  getB2bProposalById(id: string): Promise<B2bProposal | undefined>;
  updateB2bProposalStatus(id: string, status: string): Promise<B2bProposal | undefined>;

  // Portfolios
  createPortfolio(data: InsertPortfolio): Promise<Portfolio>;
  getAllPortfolios(): Promise<Portfolio[]>;
  getPortfolioById(id: string): Promise<Portfolio | undefined>;
  updatePortfolio(id: string, data: Partial<InsertPortfolio>): Promise<Portfolio | undefined>;
  deletePortfolio(id: string): Promise<void>;

  // Posts
  createPost(data: InsertPost): Promise<Post>;
  getAllPosts(): Promise<Post[]>;
  getPostById(id: string): Promise<Post | undefined>;
  updatePost(id: string, data: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: string): Promise<void>;
  incrementPostViewCount(id: string): Promise<void>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private chatHistories: Map<string, ChatHistory> = new Map();
  private bookings: Map<string, Booking> = new Map();
  private b2bProposals: Map<string, B2bProposal> = new Map();
  private portfolios: Map<string, Portfolio> = new Map();
  private posts: Map<string, Post> = new Map();

  constructor() {
    // Seed with sample data
    this.seedData();
  }

  private seedData() {
    // Sample portfolios
    const samplePortfolios: Portfolio[] = [
      {
        id: "port-1",
        title: "강남 오피스 그린 인테리어",
        description: "500평 규모의 IT 기업 사무실 전체 식물 디자인 및 관리 프로젝트",
        category: "Office",
        clientName: "테크컴퍼니",
        completedDate: new Date("2024-03-15"),
        thumbnailUrl: "https://placehold.co/800x600/22c55e/ffffff?text=Office+Plants",
        images: [
          "https://placehold.co/1200x800/22c55e/ffffff?text=Office+1",
          "https://placehold.co/1200x800/22c55e/ffffff?text=Office+2",
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
        thumbnailUrl: "https://placehold.co/800x600/10b981/ffffff?text=Residence+Garden",
        images: [
          "https://placehold.co/1200x800/10b981/ffffff?text=Residence+1",
          "https://placehold.co/1200x800/10b981/ffffff?text=Residence+2",
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
        thumbnailUrl: "https://placehold.co/800x600/14b8a6/ffffff?text=Cafe+Plants",
        images: [
          "https://placehold.co/1200x800/14b8a6/ffffff?text=Cafe+1",
          "https://placehold.co/1200x800/14b8a6/ffffff?text=Cafe+2",
        ],
        featured: true,
        createdAt: new Date("2024-01-10"),
        updatedAt: new Date("2024-01-10"),
      },
    ];

    samplePortfolios.forEach((p) => this.portfolios.set(p.id, p));

    // Sample posts
    const samplePosts: Post[] = [
      {
        id: "post-1",
        title: "초보자를 위한 겨울철 식물 관리 가이드",
        content: "# 겨울철 식물 관리의 모든 것\n\n난방으로 인한 건조함, 부족한 일조량... 겨울은 식물에게 힘든 계절입니다.",
        excerpt: "난방으로 건조해진 실내에서 식물을 건강하게 유지하는 방법을 알려드립니다.",
        thumbnailUrl: "https://placehold.co/1200x630/22c55e/ffffff?text=Winter+Care",
        category: "Plant Care",
        tags: ["겨울", "관리", "초보"],
        author: "SIMDA Team",
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
        thumbnailUrl: "https://placehold.co/1200x630/10b981/ffffff?text=Trending+Plants",
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
        thumbnailUrl: "https://placehold.co/1200x630/14b8a6/ffffff?text=Air+Purifying",
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
  async createBooking(data: InsertBooking): Promise<Booking> {
    const id = `book-${Date.now()}-${Math.random()}`;
    const booking: Booking = {
      id,
      ...data,
      status: "pending",
      createdAt: new Date(),
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async getAllBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getBookingById(id: string): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (booking) {
      booking.status = status;
      this.bookings.set(id, booking);
      return booking;
    }
    return undefined;
  }

  // B2B proposals
  async createB2bProposal(data: InsertB2bProposal): Promise<B2bProposal> {
    const id = `b2b-${Date.now()}-${Math.random()}`;
    const proposal: B2bProposal = {
      id,
      ...data,
      status: "pending",
      createdAt: new Date(),
    };
    this.b2bProposals.set(id, proposal);
    return proposal;
  }

  async getAllB2bProposals(): Promise<B2bProposal[]> {
    return Array.from(this.b2bProposals.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getB2bProposalById(id: string): Promise<B2bProposal | undefined> {
    return this.b2bProposals.get(id);
  }

  async updateB2bProposalStatus(id: string, status: string): Promise<B2bProposal | undefined> {
    const proposal = this.b2bProposals.get(id);
    if (proposal) {
      proposal.status = status;
      this.b2bProposals.set(id, proposal);
      return proposal;
    }
    return undefined;
  }

  // Portfolios
  async createPortfolio(data: InsertPortfolio): Promise<Portfolio> {
    const id = `port-${Date.now()}-${Math.random()}`;
    const portfolio: Portfolio = {
      id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.portfolios.set(id, portfolio);
    return portfolio;
  }

  async getAllPortfolios(): Promise<Portfolio[]> {
    return Array.from(this.portfolios.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getPortfolioById(id: string): Promise<Portfolio | undefined> {
    return this.portfolios.get(id);
  }

  async updatePortfolio(id: string, data: Partial<InsertPortfolio>): Promise<Portfolio | undefined> {
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
  async createPost(data: InsertPost): Promise<Post> {
    const id = `post-${Date.now()}-${Math.random()}`;
    const post: Post = {
      id,
      ...data,
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.posts.set(id, post);
    return post;
  }

  async getAllPosts(): Promise<Post[]> {
    return Array.from(this.posts.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getPostById(id: string): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async updatePost(id: string, data: Partial<InsertPost>): Promise<Post | undefined> {
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
}

export const storage = new MemStorage();
