import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import z from 'zod'

extendZodWithOpenApi(z)

export default {
  clientInputSchema: z.object({
    clientId: z.string()
  }).openapi({
    title: 'clientInput'
  }),
  clientOutputSchema: z.object({
    clientId: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    emailAddress: z.string().email(),
  }).openapi({
    title: 'clientOutput'
  }),
  headersSchema: z.object({
    'x-seek-requestid': z.string(),
    'x-seek-sessionid': z.string(),
  })
}
