import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();

    const method = req.method;
    const url = req.url;

    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - now;

        console.log(`[${method}] ${url} ${ms}ms`);
      }),
    );
  }
}
