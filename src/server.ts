import koaRouter from 'koa-router'
import { Router } from "../generators/router";
import * as contracts from './contracts'

export const router = new Router<typeof contracts>(new koaRouter())

router.get({
    name: 'getCandidateById',
    summary: 'Returns the profile of the candidate at the candidate id.  Returns not found if the candidate id does not exist',
    path: '/:candidateId',
    inputSchema: 'getCandidateInputSchema',
    outputSchema: 'getCandidateOutputSchema',
    resultTypes: ['Success', 'NotFound', 'ServerError'],
    deprecated: {
      replacement: 'getCandidateByProfileGuid'
    }
  },
  () => ({})
)

router.get({
  name: 'getCandidateByEmail',
  summary: 'Returns the profile of the candidate by email address.  Returns not found if the email address does not exist',
  path: '/:emailaddress',
  inputSchema: 'getCandidateInputSchema',
  outputSchema: 'getCandidateOutputSchema',
  resultTypes: ['Success', 'NotFound', 'ServerError'],
  deprecated: {
    replacement: null
  }
},
() => ({})
)

router.get({
  name: 'getCandidateByProfileGuid',
  summary: 'Returns the profile of the candidate by the profile guid.  Returns not found if the profile guid does not exist',
  path: '/:profileguid',
  inputSchema: 'getCandidateInputSchema',
  outputSchema: 'getCandidateOutputSchema',
  resultTypes: ['Success', 'NotFound', 'ServerError'],
},
() => ({})
)

router.put({
    name: 'updateCandidate',
    summary: 'Updates the profile of the candidate at the candidate id.  Returns not found if the candidate id does not exist',
    path: '/:candidateId',
    inputSchema: 'updateCandidateInputSchema',
    outputSchema: 'updateCandidateOutputSchema',
    resultTypes: ['Success', 'NotFound', 'ServerError']
  },
  () => ({})
)