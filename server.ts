import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { apiRouter } from './server/routes';
import { getDataSourceMode } from './server/data-source.ts';
import { checkPostgresConnection } from './server/postgres.ts';
import { postgresAuthRepository } from './server/postgres-repository.ts';
import { ensurePostgresInitialAdmin } from './server/postgres-bootstrap.ts';
import { runPostgresMigrations } from './server/postgres-migrations.ts';

dotenv.config();

function assertProductionDataSource(): void {
  if (process.env.NODE_ENV !== 'production') return;

  const mode = (process.env.KAPITECH_DATA_SOURCE || '').trim().toLowerCase();
  if (mode !== 'postgres') {
    throw new Error('Production startup requires KAPITECH_DATA_SOURCE=postgres. Refusing to run the local JSON data source in production.');
  }

  if (!process.env.KAPITECH_POSTGRES_URL?.trim()) {
    throw new Error('Production startup requires KAPITECH_POSTGRES_URL.');
  }

  if (!process.env.KAPITECH_DATA_ENCRYPTION_KEY?.trim()) {
    throw new Error('Production startup requires KAPITECH_DATA_ENCRYPTION_KEY.');
  }
}

async function startServer() {
  assertProductionDataSource();

  if (getDataSourceMode() === 'postgres') {
    await runPostgresMigrations();
    await ensurePostgresInitialAdmin();
    const migratedMfaSecrets = await postgresAuthRepository.migrateLegacyMfaSecrets();
    if (migratedMfaSecrets > 0) {
      console.log(`[Security] Re-encrypted ${migratedMfaSecrets} legacy PostgreSQL MFA secret record(s).`);
    }
  }

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

  // Keep the private AMS surface out of search indexes and intermediary caches.
  app.use((req, res, next) => {
    if (req.path === '/admin' || req.path.startsWith('/admin/') || req.path === '/api' || req.path.startsWith('/api/')) {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    }
    next();
  });

  // Health check
  app.get('/api/health', async (_req, res) => {
    try {
      const dataSource = getDataSourceMode();
      let databaseStatus: 'connected' | 'unavailable' = 'connected';
      let databaseLatencyMs: number | undefined;

      if (dataSource === 'postgres') {
        const postgresHealth = await checkPostgresConnection();
        databaseLatencyMs = postgresHealth.latencyMs;
      } else {
        const { getDatabase } = await import('./server/db');
        getDatabase();
      }

      res.json({
        status: 'ok',
        version: process.env.APP_VERSION || '2.6.0-enterprise',
        services: {
          application: 'healthy',
          database: databaseStatus,
          dataSource,
          databaseLatencyMs,
          auth: 'operational'
        },
        time: new Date().toISOString()
      });
    } catch (error) {
      console.error('Health check failed:', error);
      res.status(503).json({
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

  // API Routes
  app.use('/api', apiRouter);

  // Keep unknown API routes as JSON 404s instead of letting SPA fallback return index.html.
  app.use('/api', (_req, res) => {
    res.status(404).json({ success: false, error: 'API route not found.' });
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
