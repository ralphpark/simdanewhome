import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { chatWithAI } from "./gemini";
import { sendBookingConfirmation, sendB2BProposalNotification } from "./email";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertBookingSchema,
  insertB2bProposalSchema,
  insertPortfolioSchema,
  insertPostSchema,
  insertCommentSchema,
  insertTimelineSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  // Initialize timeline data if empty
  const existingTimelines = await storage.getAllTimelines();
  if (existingTimelines.length === 0) {
    const initialTimelines = [
      { year: "2017", title: "일산의 작은 식물가게 오픈", description: "도시 생활 속 자연과의 연결을 위해 humble한 시작", order: 1 },
      { year: "2019", title: "온라인 플랫폼 simgo.kr 런칭", description: "전국의 고객들에게 프리미엄 식물 직배송 서비스 시작", order: 2 },
      { year: "2021", title: "AI 큐레이션 기능 개발", description: "머신러닝 기반의 식물 추천 알고리즘 도입", order: 3 },
      { year: "2023", title: "지역 기반 마켓플레이스 simda.me 오픈", description: "AI 추천 + 지역 판매자 매칭 서비스 론칭", order: 4 },
      { year: "2024~", title: "지속 가능한 성장의 시대", description: "글로벌 확장과 AI 기술 고도화를 통한 더 나은 식물 경험 제공", order: 5 },
    ];
    for (const timeline of initialTimelines) {
      await storage.createTimeline(timeline);
    }
  }

  // Auth endpoint
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  // AI Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, sessionId, history = [], consultationType = "ai-curation" } = req.body;

      if (!message || !sessionId) {
        return res.status(400).json({ error: "Message and sessionId are required" });
      }

      const reply = await chatWithAI(message, history, consultationType);

      // Save to database
      await storage.createChatHistory({
        sessionId,
        userMessage: message,
        aiResponse: reply,
      });

      res.json({ reply, sessionId });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // Bookings endpoints
  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(validatedData);
      
      // Send confirmation email (non-blocking)
      sendBookingConfirmation(booking).catch(err => 
        console.error("Failed to send booking confirmation email:", err)
      );
      
      res.json(booking);
    } catch (error) {
      console.error("Create booking error:", error);
      res.status(400).json({ error: "Invalid booking data" });
    }
  });

  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Get bookings error:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const booking = await storage.getBookingById(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      console.error("Get booking error:", error);
      res.status(500).json({ error: "Failed to fetch booking" });
    }
  });

  app.patch("/api/bookings/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const booking = await storage.updateBookingStatus(req.params.id, status);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      console.error("Update booking status error:", error);
      res.status(500).json({ error: "Failed to update booking status" });
    }
  });

  // B2B proposals endpoints
  app.post("/api/b2b-proposals", async (req, res) => {
    try {
      const validatedData = insertB2bProposalSchema.parse(req.body);
      const proposal = await storage.createB2bProposal(validatedData);
      
      // Send notification email (non-blocking)
      sendB2BProposalNotification(proposal).catch(err =>
        console.error("Failed to send B2B proposal notification email:", err)
      );
      
      res.json(proposal);
    } catch (error) {
      console.error("Create B2B proposal error:", error);
      res.status(400).json({ error: "Invalid proposal data" });
    }
  });

  app.get("/api/b2b-proposals", async (req, res) => {
    try {
      const proposals = await storage.getAllB2bProposals();
      res.json(proposals);
    } catch (error) {
      console.error("Get B2B proposals error:", error);
      res.status(500).json({ error: "Failed to fetch proposals" });
    }
  });

  app.get("/api/b2b-proposals/:id", async (req, res) => {
    try {
      const proposal = await storage.getB2bProposalById(req.params.id);
      if (!proposal) {
        return res.status(404).json({ error: "Proposal not found" });
      }
      res.json(proposal);
    } catch (error) {
      console.error("Get B2B proposal error:", error);
      res.status(500).json({ error: "Failed to fetch proposal" });
    }
  });

  app.patch("/api/b2b-proposals/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const proposal = await storage.updateB2bProposalStatus(req.params.id, status);
      if (!proposal) {
        return res.status(404).json({ error: "Proposal not found" });
      }
      res.json(proposal);
    } catch (error) {
      console.error("Update B2B proposal status error:", error);
      res.status(500).json({ error: "Failed to update proposal status" });
    }
  });

  // Portfolios endpoints
  app.get("/api/portfolios", async (req, res) => {
    try {
      const portfolios = await storage.getAllPortfolios();
      res.json(portfolios);
    } catch (error) {
      console.error("Get portfolios error:", error);
      res.status(500).json({ error: "Failed to fetch portfolios" });
    }
  });

  app.get("/api/portfolios/:id", async (req, res) => {
    try {
      const portfolio = await storage.getPortfolioById(req.params.id);
      if (!portfolio) {
        return res.status(404).json({ error: "Portfolio not found" });
      }
      res.json(portfolio);
    } catch (error) {
      console.error("Get portfolio error:", error);
      res.status(500).json({ error: "Failed to fetch portfolio" });
    }
  });

  app.post("/api/portfolios", isAuthenticated, async (req, res) => {
    try {
      let data = req.body;
      
      // Handle completedDate conversion from string to Date
      if (data.completedDate && typeof data.completedDate === "string") {
        data.completedDate = new Date(data.completedDate);
      }
      
      const validatedData = insertPortfolioSchema.parse(data);
      const portfolio = await storage.createPortfolio(validatedData);
      res.json(portfolio);
    } catch (error) {
      console.error("Create portfolio error:", error);
      res.status(400).json({ error: "Invalid portfolio data" });
    }
  });

  app.patch("/api/portfolios/:id", isAuthenticated, async (req, res) => {
    try {
      let data = req.body;
      
      // Handle completedDate conversion from string to Date
      if (data.completedDate && typeof data.completedDate === "string") {
        data.completedDate = new Date(data.completedDate);
      }
      
      const portfolio = await storage.updatePortfolio(req.params.id, data);
      if (!portfolio) {
        return res.status(404).json({ error: "Portfolio not found" });
      }
      res.json(portfolio);
    } catch (error) {
      console.error("Update portfolio error:", error);
      res.status(500).json({ error: "Failed to update portfolio" });
    }
  });

  app.delete("/api/portfolios/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deletePortfolio(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete portfolio error:", error);
      res.status(500).json({ error: "Failed to delete portfolio" });
    }
  });

  // Posts endpoints
  app.get("/api/posts", async (req, res) => {
    try {
      const posts = await storage.getAllPosts();
      res.json(posts);
    } catch (error) {
      console.error("Get posts error:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const post = await storage.getPostById(req.params.id);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      
      // Increment view count
      await storage.incrementPostViewCount(req.params.id);
      
      res.json(post);
    } catch (error) {
      console.error("Get post error:", error);
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });

  app.post("/api/posts", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPostSchema.parse(req.body);
      const post = await storage.createPost(validatedData);
      res.json(post);
    } catch (error) {
      console.error("Create post error:", error);
      res.status(400).json({ error: "Invalid post data" });
    }
  });

  app.patch("/api/posts/:id", isAuthenticated, async (req, res) => {
    try {
      const post = await storage.updatePost(req.params.id, req.body);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Update post error:", error);
      res.status(500).json({ error: "Failed to update post" });
    }
  });

  app.delete("/api/posts/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deletePost(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete post error:", error);
      res.status(500).json({ error: "Failed to delete post" });
    }
  });

  // Comments endpoints
  app.get("/api/posts/:postId/comments", async (req, res) => {
    try {
      const comments = await storage.getCommentsByPostId(req.params.postId);
      res.json(comments);
    } catch (error) {
      console.error("Get comments error:", error);
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.post("/api/posts/:postId/comments", async (req, res) => {
    try {
      const validatedData = insertCommentSchema.parse({
        ...req.body,
        postId: req.params.postId,
      });
      const comment = await storage.createComment(validatedData);
      res.json(comment);
    } catch (error) {
      console.error("Create comment error:", error);
      res.status(400).json({ error: "Invalid comment data" });
    }
  });

  app.patch("/api/comments/:id/approve", async (req, res) => {
    try {
      const comment = await storage.approveComment(req.params.id);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }
      res.json(comment);
    } catch (error) {
      console.error("Approve comment error:", error);
      res.status(500).json({ error: "Failed to approve comment" });
    }
  });

  app.delete("/api/comments/:id", async (req, res) => {
    try {
      await storage.deleteComment(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete comment error:", error);
      res.status(500).json({ error: "Failed to delete comment" });
    }
  });

  // Image upload endpoint (protected)
  app.post("/api/upload", isAuthenticated, async (req, res) => {
    try {
      // File upload would typically be handled by multer middleware
      // For now, this endpoint validates authentication for image uploads
      res.json({ message: "Image upload endpoint ready" });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(400).json({ error: "Upload failed" });
    }
  });

  // Admin endpoints for managing content (protected)
  app.get("/api/admin/posts", isAuthenticated, async (req, res) => {
    try {
      const posts = await storage.getAllPosts();
      res.json(posts);
    } catch (error) {
      console.error("Get admin posts error:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.get("/api/admin/comments", isAuthenticated, async (req, res) => {
    try {
      const posts = await storage.getAllPosts();
      const allComments = [];
      for (const post of posts) {
        const comments = await storage.getCommentsByPostId(post.id);
        allComments.push(...comments);
      }
      res.json(allComments);
    } catch (error) {
      console.error("Get admin comments error:", error);
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.patch("/api/admin/posts/:id/schedule", isAuthenticated, async (req, res) => {
    try {
      const { publishedAt } = req.body;
      const post = await storage.updatePost(req.params.id, {
        publishedAt: publishedAt ? new Date(publishedAt) : null,
      });
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Schedule post error:", error);
      res.status(500).json({ error: "Failed to schedule post" });
    }
  });

  // Protected admin endpoints for posts and comments
  app.patch("/api/posts/:id", isAuthenticated, async (req, res) => {
    try {
      const post = await storage.updatePost(req.params.id, req.body);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Update post error:", error);
      res.status(400).json({ error: "Failed to update post" });
    }
  });

  app.delete("/api/posts/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deletePost(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete post error:", error);
      res.status(500).json({ error: "Failed to delete post" });
    }
  });

  app.patch("/api/comments/:id/approve", isAuthenticated, async (req, res) => {
    try {
      const comment = await storage.approveComment(req.params.id);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }
      res.json(comment);
    } catch (error) {
      console.error("Approve comment error:", error);
      res.status(500).json({ error: "Failed to approve comment" });
    }
  });

  app.delete("/api/comments/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteComment(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete comment error:", error);
      res.status(500).json({ error: "Failed to delete comment" });
    }
  });

  // Timelines endpoints
  app.get("/api/timelines", async (req, res) => {
    try {
      const timelines = await storage.getAllTimelines();
      res.json(timelines);
    } catch (error) {
      console.error("Get timelines error:", error);
      res.status(500).json({ error: "Failed to fetch timelines" });
    }
  });

  app.post("/api/timelines", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertTimelineSchema.parse(req.body);
      const timeline = await storage.createTimeline(validatedData);
      res.json(timeline);
    } catch (error) {
      console.error("Create timeline error:", error);
      res.status(400).json({ error: "Invalid timeline data" });
    }
  });

  app.patch("/api/timelines/:id", isAuthenticated, async (req, res) => {
    try {
      const timeline = await storage.updateTimeline(req.params.id, req.body);
      if (!timeline) {
        return res.status(404).json({ error: "Timeline not found" });
      }
      res.json(timeline);
    } catch (error) {
      console.error("Update timeline error:", error);
      res.status(500).json({ error: "Failed to update timeline" });
    }
  });

  app.delete("/api/timelines/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteTimeline(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete timeline error:", error);
      res.status(500).json({ error: "Failed to delete timeline" });
    }
  });

  // Booking and B2B status update endpoints
  app.patch("/api/b2b-proposals/:id/status", isAuthenticated, async (req, res) => {
    try {
      const { status } = req.body;
      const proposal = await storage.updateB2bProposalStatus(req.params.id, status);
      if (!proposal) {
        return res.status(404).json({ error: "Proposal not found" });
      }
      res.json(proposal);
    } catch (error) {
      console.error("Update B2B proposal status error:", error);
      res.status(500).json({ error: "Failed to update proposal status" });
    }
  });

  // Get all bookings and proposals for admin
  app.get("/api/admin/bookings", isAuthenticated, async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Get admin bookings error:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.get("/api/admin/b2b-proposals", isAuthenticated, async (req, res) => {
    try {
      const proposals = await storage.getAllB2bProposals();
      res.json(proposals);
    } catch (error) {
      console.error("Get admin B2B proposals error:", error);
      res.status(500).json({ error: "Failed to fetch proposals" });
    }
  });

  // SEO Sitemap endpoint
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const posts = await storage.getAllPosts();
      const portfolios = await storage.getAllPortfolios();
      
      const baseUrl = `${req.protocol}://${req.hostname}`;
      const now = new Date().toISOString();
      
      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/services</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/portfolio</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/magazine</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/booking</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/b2b</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/shop</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/support</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;

      // Add published posts
      posts.filter(p => p.published).forEach(post => {
        sitemap += `
  <url>
    <loc>${baseUrl}/magazine/${post.id}</loc>
    <lastmod>${post.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      });

      // Add portfolios
      portfolios.forEach(portfolio => {
        sitemap += `
  <url>
    <loc>${baseUrl}/portfolio/${portfolio.id}</loc>
    <lastmod>${portfolio.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
      });

      sitemap += `
</urlset>`;

      res.header("Content-Type", "application/xml");
      res.send(sitemap);
    } catch (error) {
      console.error("Sitemap generation error:", error);
      res.status(500).send("Failed to generate sitemap");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
