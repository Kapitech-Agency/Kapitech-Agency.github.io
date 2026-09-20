import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { apiRouter } from './server/routes';

dotenv.config();

async function startServer() {
  const app = express();
  app.disable('x-powered-by');
  const PORT = Number(process.env.PORT) || 3000;

  // Hostinger/reverse-proxy aware client IP handling for rate limiting and audit logs.
  app.set('trust proxy', 1);

  // Security Headers Middleware
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), usb=()');
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

    if (process.env.NODE_ENV === 'production') {
      res.setHeader(
        'Content-Security-Policy',
        [
          "default-src 'self'",
          "script-src 'self'",
          "style-src 'self' 'unsafe-inline'",
          "font-src 'self' data:",
          "img-src 'self' data: blob: https:",
          "connect-src 'self'",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'none'",
          "upgrade-insecure-requests"
        ].join('; ')
      );
      if (req.secure) {
        res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
      }
    }
    next();
  });

  // Binary private-document uploads are parsed before the JSON body parser.
  // The vault route is authenticated again inside apiRouter, and files are stored outside public static assets.
  app.put('/api/documents/:id/content', express.raw({ type: () => true, limit: '25mb' }));

  // Body parsers
  app.use(express.json({ limit: '512kb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Prevent browsers and intermediary caches from storing authenticated API responses.
  app.use('/api', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  // API Routes
  app.use('/api', apiRouter);

  // Health check
  app.get('/api/health', async (req, res) => {
    try {
      const { getDatabase } = await import('./server/db');
      getDatabase();

      res.json({
        status: 'ok',
        version: process.env.APP_VERSION || '2.6.0-enterprise',
        services: {
          application: 'healthy',
          database: 'connected',
          auth: 'operational'
        },
        time: new Date().toISOString()
      });
    } catch (error) {
      console.error('Health check failed:', error);
      res.status(500).json({
        status: 'error',
        services: {
          application: 'degraded',
          database: 'unavailable',
          auth: 'unknown'
        },
        message: 'Health check failed'
      });
    }
  });

  // Vite middleware in dev, static files in prod
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');

    // Never expose backend bundles or source maps as public static assets.
    app.use((req, res, next) => {
      if (req.path === '/server.cjs' || req.path.endsWith('.map')) {
        res.status(404).end();
        return;
      }
      next();
    });

    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Kapitech AMS Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
