import z from 'zod'
import { inputBase } from '../src/client-sdk-lib/types'

export default {
  clientInputSchema: inputBase.merge(z.object({
    clientId: z.string()
  })),
  clientOutputSchema: z.object({
    clientId: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    emailAddress: z.string().email(),
  }),
}
