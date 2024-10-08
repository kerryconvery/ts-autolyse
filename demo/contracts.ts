import z from 'zod'

export default {
  clientInputSchema: z.object({
    clientId: z.string()
  }),
  clientOutputSchema: z.object({
    lastName: z.string()
  }),
  headersSchema: z.object({
    'x-seek-requestid': z.string(),
    'x-seek-sessionid': z.string(),
  })
}
