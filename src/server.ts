import koaRouter from 'koa-router'
import { Router } from "../generators/router";
import * as contracts from './contracts'

export const router = new Router<typeof contracts>(new koaRouter())

router.get({
    name: 'GetCandidateById',
    summary: 'Returns the profile of the candidate at the candidate id.  Returns not found if the candidate id does not exist',
    path: '/:candidateId',
    inputSchema: 'getCandidateInputSchema',
    outputSchema: 'getCandidateOutputSchema',
    resultTypes: ['Success', 'NotFound', 'ServerError'],
    deprecated: true
  },
  () => ({})
)

router.put({
    name: 'UpdateCandidate',
    summary: 'Updates the profile of the candidate at the candidate id.  Returns not found if the candidate id does not exist',
    path: '/:candidateId',
    inputSchema: 'updateCandidateInputSchema',
    outputSchema: 'updateCandidateOutputSchema',
    resultTypes: ['Success', 'NotFound', 'ServerError']
  },
  () => ({})
)