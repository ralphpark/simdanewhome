import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { chatWithAI } from "./ai-chat";
import { z } from "zod";
import {
  sendBookingConfirmation,
  sendBookingNotification,
  sendB2BProposalConfirmation,
  sendB2BProposalNotification,
} from "./email";
import { setupAuth, isAuthenticated } from "./auth";
import {
  insertBookingSchema,
  insertB2bProposalSchema,
  insertPortfolioSchema,
  insertPostSchema,
  insertCommentSchema,
  insertTimelineSchema,
  insertDocumentSchema,
} from "@shared/schema";
import multer from "multer";
import path from "path";
import { put } from "@vercel/blob";
import { registerSiteTextRoutes } from "./site-text-routes";
import { registerSiteImageRoutes } from "./site-image-routes";

const chatRequestSchema = z.object({
  message: z.string().min(1).max(2000).refine(value => value.trim().length > 0),
  sessionId: z.string().min(1).max(100).refine(value => value.trim().length > 0),
  history: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().max(4000),
  })).max(60).default([]),
  consultationType: z.enum(["ai-curation", "plant-care"]).default("ai-curation"),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  registerSiteImageRoutes(app, storage, isAuthenticated);
  registerSiteTextRoutes(app, storage, isAuthenticated);

  // Auth endpoint
  app.get("/api/auth/user", isAuthenticated, (_req, res) => {
    res.json({ id: "admin" });
  });
  // AI Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const parsed = chatRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "상담 요청 형식이 올바르지 않습니다." });
      }
      const { message, sessionId, history, consultationType } = parsed.data;

      const reply = await chatWithAI(message, history, consultationType);

      // Save to database
      await storage.createChatHistory({
        sessionId,
        userMessage: message,
        aiResponse: reply,
      });

      res.json({ reply, sessionId });
    } catch (error) {
      console.error("Chat error:", error instanceof Error ? error.name : "Unknown error");
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // Bookings endpoints
  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(validatedData);
      
      const emailResults = await Promise.allSettled([
        sendBookingNotification(booking),
        sendBookingConfirmation(booking),
      ]);
      emailResults.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(`Failed to send booking ${index === 0 ? "notification" : "confirmation"} email:`, result.reason);
        }
      });
      
      res.json(booking);
    } catch (error) {
      console.error("Create booking error:", error);
      res.status(400).json({ error: "Invalid booking data" });
    }
  });

  app.get("/api/bookings", isAuthenticated, async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Get bookings error:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/:id", isAuthenticated, async (req, res) => {
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

  app.patch("/api/bookings/:id/status", isAuthenticated, async (req, res) => {
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
      
      const emailResults = await Promise.allSettled([
        sendB2BProposalNotification(proposal),
        sendB2BProposalConfirmation(proposal),
      ]);
      emailResults.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(`Failed to send B2B proposal ${index === 0 ? "notification" : "confirmation"} email:`, result.reason);
        }
      });
      
      res.json(proposal);
    } catch (error) {
      console.error("Create B2B proposal error:", error);
      res.status(400).json({ error: "Invalid proposal data" });
    }
  });

  app.get("/api/b2b-proposals", isAuthenticated, async (req, res) => {
    try {
      const proposals = await storage.getAllB2bProposals();
      res.json(proposals);
    } catch (error) {
      console.error("Get B2B proposals error:", error);
      res.status(500).json({ error: "Failed to fetch proposals" });
    }
  });

  app.get("/api/b2b-proposals/:id", isAuthenticated, async (req, res) => {
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

  app.get("/api/timelines/:id", async (req, res) => {
    try {
      const timeline = await storage.getTimelineById(req.params.id);
      if (!timeline) {
        return res.status(404).json({ error: "Timeline not found" });
      }
      res.json(timeline);
    } catch (error) {
      console.error("Get timeline error:", error);
      res.status(500).json({ error: "Failed to fetch timeline" });
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

  // Documents endpoints
  app.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getAllDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Get documents error:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  // Document upload endpoint
  // ponytail: Vercel 함수 요청 한도 4.5MB 때문에 4MB 로 제한. 더 큰 파일이 필요하면 @vercel/blob/client 의 upload() 로 브라우저에서 직접 올린다
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 4 * 1024 * 1024 },
  });

  app.post("/api/documents/upload", isAuthenticated, (req, res, next) => {
    upload.single("file")(req, res, (err) =>
      err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE"
        ? res.status(413).json({ error: "파일은 4MB 이하만 올릴 수 있습니다" })
        : next(err),
    );
  }, async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "파일을 선택해주세요" });
      }

      const { name, type } = req.body;
      if (!name || !type) {
        return res.status(400).json({ error: "문서명과 유형을 입력해주세요" });
      }

      // Create URL-safe filename (avoid Korean encoding issues)
      const ext = path.extname(req.file.originalname);
      const safeFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}${ext}`;
      
      const contentTypes: Record<string, string> = {
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
      const blob = await put(`documents/${safeFileName}`, req.file.buffer, {
        access: "public",
        contentType: contentTypes[ext.toLowerCase()] || "application/octet-stream",
      });
      const fileUrl = blob.url;

      const document = await storage.createDocument({
        name,
        type,
        fileUrl,
      });

      res.json(document);
    } catch (error) {
      console.error("Upload document error:", error);
      res.status(500).json({ error: "파일 업로드에 실패했습니다" });
    }
  });

  app.post("/api/documents", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(validatedData);
      res.json(document);
    } catch (error) {
      console.error("Create document error:", error);
      res.status(400).json({ error: "Invalid document data" });
    }
  });

  app.delete("/api/documents/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteDocument(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete document error:", error);
      res.status(500).json({ error: "Failed to delete document" });
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
