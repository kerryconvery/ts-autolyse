import { Router } from '../src/router'
import KoaRouter from 'koa-router'
import { z } from 'zod';
import { NotFound, ServerError, Success } from '../src/client-sdk-lib/types';
import contracts from './contracts';
import { success } from './sdk-build/types';

type Contracts = typeof contracts;

export const router = new Router<Contracts>(new KoaRouter(), contracts);

const getHandler = (
  { clientId }: z.infer<typeof contracts.clientInputSchema>,
  {'x-seek-requestid': requestId, 'x-seek-sessionid': sessionId }: z.infer<typeof contracts.headersSchema>
): Promise<Success<z.infer<typeof contracts.clientOutputSchema>> | NotFound | ServerError> => {
  console.log(clientId, requestId, sessionId)

  return Promise.resolve(success({
    clientId,
    firstName: 'Joe',
    lastName: 'Smith',
    emailAddress: 'joesmith@example.com'
  }))
}

router.get({
  name: 'getClientById',
  summary: 'Gets the client with the provided client id',
  path: '/:clientid',
  headerSchema: 'headersSchema',
  inputSchema: 'clientInputSchema',
  outputSchema: 'clientOutputSchema',
  resultTypes: ['Success', 'NotFound', 'ServerError']
}, getHandler)
