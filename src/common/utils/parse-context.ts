import { ExecutionContext } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

export interface Context {
  request: Request;
}

export const parseContext = (context: ExecutionContext) => {
  if (context.getType<GqlContextType>() === 'graphql') {
    const ctx = GqlExecutionContext.create(context).getContext();
    return {
      request: ctx.req,
    };
  } else if (context.getType() === 'http') {
    const ctx = context.switchToHttp();
    return {
      request: ctx.getRequest(),
    };
  } else {
    throw new Error(`can't parse this context type: ${context.getType()}`);
  }
};
