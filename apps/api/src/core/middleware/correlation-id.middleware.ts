/**
 * Correlation ID Middleware
 *
 * Generates or extracts correlation IDs for request tracing.
 * Useful for distributed tracing and debugging.
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Get correlation ID from header or generate new one
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      randomUUID();

    // Attach to request for use in services
    req['correlationId'] = correlationId;

    // Add to response headers
    res.setHeader('X-Correlation-ID', correlationId);

    next();
  }
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
    }
  }
}
