import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { parseContext } from '../utils/parse-context';
import { TRANSACTION_MANAGER_KEY } from './constants';

export const TransactionParam = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    return parseContext(context).request[TRANSACTION_MANAGER_KEY];
  },
);
