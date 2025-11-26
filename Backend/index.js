import OpenAI from "openai";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from 'mongoose'
import chatRoutes from "./routes/chat.js";
import path from "path";
import { fileURLToPath } from "url";
import logger, { requestLogger, errorLogger } from "./utils/logger.js";
import { healthCheck, metricsCheck, readinessCheck, livenessCheck } from "./utils/health.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

dotenv.config();

// Set Google Cloud credentials path (absolute path)
process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
  path.resolve(__dirname, "gen-lang-client-0514898714-71b9c5ae081a.json");

// ─────────────────────────────────────────────────────────────
// Health & Monitoring Endpoints (before other middleware)
// ─────────────────────────────────────────────────────────────
app.get('/health', healthCheck);
app.get('/metrics', metricsCheck);
app.get('/ready', readinessCheck);
app.get('/live', livenessCheck);

// ─────────────────────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────────────────────
app.use(requestLogger);  // HTTP request logging
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => logger.info("Connected to MongoDB"))
  .catch((err) => logger.error("MongoDB connection error:", { error: err.message }));

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
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
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// ─────────────────────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`, { 
    env: process.env.NODE_ENV || 'development',
    port: PORT 
  });
});

app.post("/test", async (req, res) => {

  const query = req.body.query;
  const response = await openai.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      {
        role: "user",
        content: req.body.query,
      },
    ],
  });
  res.send(response.choices[0].message);
});




