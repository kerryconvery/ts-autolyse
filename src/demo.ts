import { Router } from './router'
import KoaRouter from 'koa-router'
import * as contracts from './contracts'
import { z } from 'zod';
import { NotFound, ServerError, Success, ValidationError, validationError } from './client-sdk-lib/types';
import { generateClientSdk } from './client-sdk-generator'
import { generateOpenApiSpec } from './openapi-spec-generator'
import { Sdk } from '../sdk-build'

type Contracts = typeof contracts;

export const router = new Router<Contracts>(new KoaRouter());

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

generateClientSdk(router.getConfiguredRoutes(), './src/contracts.ts', { Prod: { url: ''}, Dev: { url: ''}}, './sdk-build')
generateOpenApiSpec(router.getConfiguredRoutes(), contracts, './openapi')

const sdk = new Sdk('Dev', () => Promise.resolve({}))

sdk.getClientById({ clientId: '' })