import z from 'zod';

export const candidateSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  emailAddress: z.string(),
}).openapi('Candidate')

export const updateCandidateInputSchema= z.object({
  candidateId: z.number(),
  ...candidateSchema.shape
}).openapi('UpdateCandidateInput')

export const updateCandidateOutputSchema=  z.null().openapi('UpdateCandidateOutput')

export const   getCandidateInputSchema = z.object({
  candidateId: z.number().min(8),
}).openapi('GetCandidateInput')

export const  getCandidateOutputSchema = candidateSchema.extend({
  candidateId: z.number(),
}).openapi('GetCandidateOutput')

