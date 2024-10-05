import { Router } from '../src/router'
import KoaRouter from 'koa-router'
import { z } from 'zod';
import { NotFound, ServerError, Success, ValidationError, validationError } from '../src/client-sdk-lib/types';
import contracts from './contracts';
import { Sdk } from './sdk-build'

type Contracts = typeof contracts;

export const router = new Router<Contracts>(new KoaRouter(), contracts);

const getHandler = ({ clientId: string }: z.infer<typeof contracts.clientInputSchema>): Promise<Success<{ lastName: string }> | NotFound | ServerError | ValidationError> => {
  return Promise.resolve(validationError(''))
}

router.get({
  name: 'getClientById',
  summary: 'gets the client with the provided client id',
  path: '/:clientid',
  inputSchema: 'clientInputSchema',
  outputSchema: 'clientOutputSchema',
  resultTypes: ['Success', 'NotFound', 'ServerError', 'ValidationError']
}, getHandler)

const sdk = new Sdk('Dev', () => Promise.resolve({}))

sdk.getClientById({ clientId: '' })