import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';

export class TransactionalInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    console.log('TransactionalInterceptor');
    return next.handle();
  }
}
