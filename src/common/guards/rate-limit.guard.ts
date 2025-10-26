import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

interface RequestWithIp {
  url: string;
  headers: {
    'x-forwarded-for'?: string;
    'x-real-ip'?: string;
  };
  connection?: {
    remoteAddress?: string;
  };
  socket?: {
    remoteAddress?: string;
  };
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private store: RateLimitStore = {};
  private readonly ttl: number;
  private readonly max: number;

  constructor(private reflector: Reflector) {
    // Configuração do Rate Limit via variáveis de ambiente
    this.ttl = parseInt(process.env.RATE_LIMIT_TTL || '60', 10) * 1000; // Converter para ms
    this.max = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithIp>();
    const ip = this.getClientIp(request);
    const key = `${ip}:${request.url}`;

    const now = Date.now();
    const record = this.store[key];

    // Limpar registros expirados periodicamente
    this.cleanExpiredRecords(now);

    if (!record || now > record.resetTime) {
      // Criar novo registro ou resetar expirado
      this.store[key] = {
        count: 1,
        resetTime: now + this.ttl,
      };
      return true;
    }

    if (record.count >= this.max) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests, please try again later',
          retryAfter: Math.ceil((record.resetTime - now) / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    record.count++;
    return true;
  }

  private getClientIp(request: RequestWithIp): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      'unknown'
    );
  }

  private cleanExpiredRecords(now: number): void {
    // Limpar a cada 60 segundos
    if (!this.lastCleanup || now - this.lastCleanup > 60000) {
      Object.keys(this.store).forEach((key) => {
        if (this.store[key].resetTime < now) {
          delete this.store[key];
        }
      });
      this.lastCleanup = now;
    }
  }

  private lastCleanup: number = Date.now();
}
