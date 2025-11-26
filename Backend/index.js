import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import chatRoutes from "./routes/chat.js";
import logger, { requestLogger, errorLogger } from "./utils/logger.js";
import { healthCheck, metricsCheck, readinessCheck, livenessCheck } from "./utils/health.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

dotenv.config();

// Set Google Cloud credentials path (absolute path)
if (process.env.GOOGLE_APPLICATION_CREDENTIALS && !path.isAbsolute(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(__dirname, "gen-lang-client-0514898714-71b9c5ae081a.json");
}

// ─────────────────────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(requestLogger);

// ─────────────────────────────────────────────────────────────
// Health & Monitoring Endpoints (before other routes)
// ─────────────────────────────────────────────────────────────
app.get('/health', healthCheck);
app.get('/metrics', metricsCheck);
app.get('/ready', readinessCheck);
app.get('/live', livenessCheck);

// Basic route
app.get("/", (req, res) => {
  res.json({ 
    message: "AI Resume Analyzer API",
    status: "running",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// ─────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────
app.use("/api", chatRoutes);

// ─────────────────────────────────────────────────────────────
// Error handling middleware
// ─────────────────────────────────────────────────────────────
app.use(errorLogger);
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// 404 handler
app.use((req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────────────────────
// Start Server Function
// ─────────────────────────────────────────────────────────────
async function startServer() {
  try {
    // Start server first (for health checks)
    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Connect to MongoDB after server starts (non-blocking)
    if (process.env.MONGODB_URI) {
      logger.info('🔌 Connecting to MongoDB...');
      try {
        await mongoose.connect(process.env.MONGODB_URI);
        logger.info('✅ Connected to MongoDB successfully');
      } catch (error) {
        logger.error('⚠️  MongoDB connection failed, continuing without database:', error.message);
      }
    } else {
      logger.warn('⚠️  No MONGODB_URI provided, running without database');
    }

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('📴 SIGTERM received, shutting down gracefully...');
      server.close(() => {
        mongoose.connection.close();
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();




