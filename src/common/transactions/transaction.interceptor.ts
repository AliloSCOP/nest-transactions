import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Observable, of } from 'rxjs';
import { retryWhen, take, tap } from 'rxjs/operators';
import { Connection } from 'typeorm';
import { Context, parseContext } from '../utils/parse-context';
import { TRANSACTION_MANAGER_KEY } from './constants';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    console.log('Interceptor');

    return of(this.withTransaction(parseContext(context), () => next.handle()));
  }

  private async withTransaction<T>(
    ctx: Context,
    work: () => Observable<T>,
  ): Promise<T> {
    const queryRunnerExists = !!ctx.request[TRANSACTION_MANAGER_KEY];

    if (queryRunnerExists) {
      return work().toPromise();
    }

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    // save manager in req
    ctx.request[TRANSACTION_MANAGER_KEY] = queryRunner.manager;

    try {
      const maxRetries = 5;
      const result = await work()
        .pipe(
          retryWhen((errors) =>
            errors.pipe(
              tap((err) => {
                if (!this.isRetriableError(err)) {
                  throw err;
                }
              }),
              take(maxRetries),
            ),
          ),
        )
        .toPromise();
      if (queryRunner.isTransactionActive) {
        await queryRunner.commitTransaction();
      }
      return result;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      if (queryRunner?.isReleased === false) {
        await queryRunner.release();
      }
    }
  }

  private isRetriableError(err: any): boolean {
    const mysqlDeadlock = err.code === 'ER_LOCK_DEADLOCK';
    return mysqlDeadlock;
  }
}
