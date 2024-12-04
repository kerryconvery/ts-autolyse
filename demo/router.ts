import { Router } from '../src/router'
import { z } from 'zod';
import { NotFound, InternalError, Content } from '../src/client-sdk-lib/types';
import contracts from './contracts';
import { content } from '../src/client-sdk-lib/types'

type Contracts = typeof contracts;

export const router = new Router<Contracts>(contracts);

const getHandler = (
  { clientId }: z.infer<typeof contracts.clientInputSchema>,
): Promise<Content<z.infer<typeof contracts.clientOutputSchema>> | NotFound | InternalError> => {
  return Promise.resolve(content({
    clientId,
    firstName: 'Joe',
    lastName: 'Smith',
    emailAddress: 'joesmith@example.com'
  }))
}

router.add({
  name: 'getClientById',
  summary: 'Gets the client with the provided client id',
  path: '/:clientid',
  method: 'GET',
  inputSchema: 'clientInputSchema',
  outputSchema: 'clientOutputSchema',
  resultTypes: ['Content', 'NotFound', 'InternalError']
}, getHandler)
