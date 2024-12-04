import z from 'zod'

export default {
  clientInputSchema: z.object({
    clientId: z.string()
  }),
  clientOutputSchema: z.object({
    clientId: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    emailAddress: z.string().email(),
  }),
  headers: z.object({
    'x-request-id': z.string(),
    testRecord: z.boolean()
  })
}
