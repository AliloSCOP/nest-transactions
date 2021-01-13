import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { TransactionalInterceptor } from './transaction.interceptor';

export function Transactional() {
  return applyDecorators(UseInterceptors(TransactionalInterceptor));
}
