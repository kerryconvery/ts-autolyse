import { Router } from '../src/router'
import { z } from 'zod';
import { NoContent, noContent, NotFound, InternalError, Success } from '../src/client-sdk-lib/types';
import contracts from './contracts';
import { success } from '../src/client-sdk-lib/types'

type Contracts = typeof contracts;

export const router = new Router<Contracts>(contracts);

const getHandler = (
  { clientId, metadata }: z.infer<typeof contracts.clientInputSchema>,
): Promise<Success<z.infer<typeof contracts.clientOutputSchema>> | NotFound | InternalError> => {
  console.log(clientId, metadata.requestId, metadata.sessionId)

  return Promise.resolve(success({
    clientId,
    firstName: 'Joe',
    lastName: 'Smith',
    emailAddress: 'joesmith@example.com'
  }))

  // return Promise.resolve(noContent())
}

router.add({
  name: 'getClientById',
  summary: 'Gets the client with the provided client id',
  path: '/:clientid',
  method: 'GET',
  inputSchema: 'clientInputSchema',
  outputSchema: 'clientOutputSchema',
  resultTypes: ['Success', 'NotFound', 'InternalError']
}, getHandler)
