import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

/**
 * Middleware, validation and routing shared by the server and the e2e tests,
 * so tests exercise the app exactly as it runs in production.
 */
export const configureApp = (app: NestExpressApplication): void => {
  const configService = app.get(ConfigService);

  // Behind nginx set TRUST_PROXY_HOPS=1, otherwise every request looks like it comes from nginx
  // and all users share one throttling bucket. Keep 0 when exposed directly, or X-Forwarded-For can be spoofed
  app.set('trust proxy', Number(configService.get('TRUST_PROXY_HOPS', 0)));

  app.use(cookieParser());
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'none'"],
          scriptSrc: ["'none'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', 'http://localhost:5173'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix('api');
  app.enableShutdownHooks();
};
