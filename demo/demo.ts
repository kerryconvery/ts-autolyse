import { Router } from '../src/router'
import KoaRouter from 'koa-router'
import { z } from 'zod';
import { NotFound, ServerError, Success, ValidationError } from '../src/client-sdk-lib/types';
import contracts from './contracts';
import { Sdk } from './sdk-build'
import { success } from './sdk-build/types';

type Contracts = typeof contracts;

export const router = new Router<Contracts>(new KoaRouter(), contracts);

const getHandler = ({ clientId }: z.infer<typeof contracts.clientInputSchema>): Promise<Success<{ lastName: string }> | NotFound | ServerError> => {
  return Promise.resolve(success({
    lastName: ''
  }))
}

router.get({
  name: 'getClientById',
  summary: 'gets the client with the provided client id',
  path: '/:clientid',
  inputSchema: 'clientInputSchema',
  outputSchema: 'clientOutputSchema',
  resultTypes: ['Success', 'NotFound', 'ServerError']
}, getHandler)

