import z from 'zod'
import { inputSchema } from '../src/client-sdk-lib/types'

export default {
  clientInputSchema: inputSchema.extend({
    clientId: z.string()
  }),
  clientOutputSchema: z.object({
    clientId: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    emailAddress: z.string().email(),
  })
}
