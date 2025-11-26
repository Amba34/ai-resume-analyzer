import winston from 'winston';

// ─────────────────────────────────────────────────────────────
// Logger Configuration - Winston with structured JSON logging
// ─────────────────────────────────────────────────────────────

const { combine, timestamp, printf, colorize, json } = winston.format;

// Custom format for development (readable)
const devFormat = printf(({ level, message, timestamp, ...meta }) => {
  const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
  return `${timestamp} [${level}]: ${message} ${metaStr}`;
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { 
    service: 'ai-resume-backend',
    version: process.env.npm_package_version || '1.0.0'
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production'
        ? combine(timestamp(), json())  // JSON for production (cloud logging)
        : combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), devFormat)
    }),
    // File transport for errors (production)
    ...(process.env.NODE_ENV === 'production' ? [
      new winston.transports.File({ 
        filename: 'logs/error.log', 
        level: 'error',
        format: combine(timestamp(), json())
      }),
      new winston.transports.File({ 
        filename: 'logs/combined.log',
        format: combine(timestamp(), json())
      })
    ] : [])
  ],
});

// ─────────────────────────────────────────────────────────────
// HTTP Request Logger Middleware (Morgan-style)
// ─────────────────────────────────────────────────────────────
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    };
    
    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });
  
  next();
};

// ─────────────────────────────────────────────────────────────
// Error Logger Middleware
// ─────────────────────────────────────────────────────────────
export const errorLogger = (err, req, res, next) => {
  logger.error('Unhandled Error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    body: req.body
  });
  next(err);
};

export default logger;
