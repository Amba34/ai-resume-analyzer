import mongoose from 'mongoose';
import os from 'os';

// ─────────────────────────────────────────────────────────────
// Health Check & Metrics Endpoints
// ─────────────────────────────────────────────────────────────

const startTime = Date.now();

// Simple health check
export const healthCheck = (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  const health = {
    status: mongoStatus === 'connected' ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    mongodb: mongoStatus
  };
  
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
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

// Readiness check (for Kubernetes/Cloud Run)
export const readinessCheck = (req, res) => {
  const isReady = mongoose.connection.readyState === 1;
  
  if (isReady) {
    res.status(200).json({ ready: true });
  } else {
    res.status(503).json({ ready: false, reason: 'Database not connected' });
  }
};

// Liveness check (for Kubernetes/Cloud Run)
export const livenessCheck = (req, res) => {
  res.status(200).json({ alive: true });
};
