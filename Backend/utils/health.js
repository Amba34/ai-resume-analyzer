import mongoose from 'mongoose';
import os from 'os';
import logger from './logger.js';

// ─────────────────────────────────────────────────────────────
// Health Check & Metrics Endpoints
// ─────────────────────────────────────────────────────────────

const startTime = Date.now();

// Basic health check (always responds quickly)
export const healthCheck = async (req, res) => {
  try {
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startTime) / 1000),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
      },
    };

    // Check MongoDB connection (non-blocking)
    if (mongoose.connection.readyState === 1) {
      health.database = { status: "connected", state: "ready" };
    } else if (mongoose.connection.readyState === 2) {
      health.database = { status: "connecting", state: "connecting" };
    } else {
      health.database = { status: "disconnected", state: "not connected" };
    }

    // Always return 200 for basic health check
    res.status(200).json(health);
    
  } catch (error) {
    logger.error("Health check error:", error);
    res.status(200).json({
      status: "degraded",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

// Detailed metrics endpoint
export const metricsCheck = (req, res) => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  const metrics = {
    timestamp: new Date().toISOString(),
    uptime: {
      process: Math.floor(process.uptime()),
      system: Math.floor(os.uptime())
    },
    memory: {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
      rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
      external: Math.round(memUsage.external / 1024 / 1024) + ' MB',
      systemFree: Math.round(os.freemem() / 1024 / 1024) + ' MB',
      systemTotal: Math.round(os.totalmem() / 1024 / 1024) + ' MB'
    },
    cpu: {
      user: Math.round(cpuUsage.user / 1000) + ' ms',
      system: Math.round(cpuUsage.system / 1000) + ' ms',
      cores: os.cpus().length
    },
    database: {
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      host: mongoose.connection.host || 'N/A',
      name: mongoose.connection.name || 'N/A'
    },
    environment: {
      nodeVersion: process.version,
      platform: os.platform(),
      arch: os.arch(),
      env: process.env.NODE_ENV || 'development'
    }
  };
  
  res.status(200).json(metrics);
};

// Kubernetes/Cloud Run liveness probe
export const livenessCheck = (req, res) => {
  res.status(200).json({ status: "alive", timestamp: new Date().toISOString() });
};

// Kubernetes/Cloud Run readiness probe
export const readinessCheck = async (req, res) => {
  try {
    // Check if we can accept traffic
    const isReady = mongoose.connection.readyState === 1 || !process.env.MONGODB_URI;
    
    if (isReady) {
      res.status(200).json({ 
        status: "ready", 
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? "connected" : "not required"
      });
    } else {
      res.status(503).json({ 
        status: "not ready", 
        timestamp: new Date().toISOString(),
        database: "connecting"
      });
    }
  } catch (error) {
    logger.error("Readiness check error:", error);
    res.status(503).json({ status: "not ready", error: error.message });
  }
};
