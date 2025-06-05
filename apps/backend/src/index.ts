import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import tasksRouter from "./routes/tasks";
import llmRouter from "./routes/llm";

// Load environment variables
dotenv.config();

const app = express();
const isDevelopment = process.env.NODE_ENV === "development";

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: isDevelopment 
    ? ["http://localhost:3000", "http://localhost:8081", "exp://"] // Expo dev server
    : process.env.ALLOWED_ORIGINS?.split(",") || [],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 100, // Limit each IP to 100 requests per windowMs in production
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// LLM-specific rate limiting
const llmLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isDevelopment ? 100 : 10, // Limit LLM requests to 10 per minute in production
  message: "Too many LLM requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API routes
app.use("/api/tasks", tasksRouter);
app.use("/api/llm", llmLimiter, llmRouter);

// 404 handler
app.use("*", (_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Global error handler:", err);
  
  res.status(err.status || 500).json({
    error: isDevelopment ? err.message : "Internal server error",
    ...(isDevelopment && { stack: err.stack }),
  });
});

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`🚀 notify-backend listening on http://localhost:${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  
  if (isDevelopment) {
    console.log(`📋 API Documentation:`);
    console.log(`   Tasks: http://localhost:${port}/api/tasks`);
    console.log(`   LLM: http://localhost:${port}/api/llm`);
  }
});
