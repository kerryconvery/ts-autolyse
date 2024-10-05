import z from 'zod'

export const clientInputSchema = z.object({
  clientId: z.string()
})

export const clientOutputSchema = z.object({
  lastName: z.string()
})
