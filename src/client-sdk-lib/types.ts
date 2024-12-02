import { z } from "zod";

export type Environment = 'Dev' | 'Prod' 
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export type Success<T> = {
  success: true,
  resultType: 'Success'
  data: T
}

export type NoContent = {
  success: true,
  resultType: 'NoContent'
}

export type NotFound = {
  success: false,
  resultType: 'NotFound'
}

export type ValidationError = {
  success: false,
  resultType: 'ValidationError',
  message: string
}

export type InternalError = {
  success: false,
  resultType: 'InternalError'
}

export type Headers = {
  authorization?: string,
  requestId?: string,
  sessionId?: string,
}

export type Result<T> = Success<T> | NoContent | NotFound | ValidationError | InternalError
export type ResultType = Result<any>['resultType'] extends infer Reason ? Reason : never

export type HttpClient = (input: string, init?: RequestInit) => Promise<Response>

export const success = <T>(data: T): Success<T> => ({
  success: true,
  resultType: 'Success',
  data
})

export const noContent = (): NoContent => ({
  success: true,
  resultType: 'NoContent',
})

export const notFound = (): NotFound => ({
  success: false,
  resultType: 'NotFound'
})

export const validationError = (message: string): ValidationError => ({
  success: false,
  resultType: 'ValidationError',
  message
})

export const internalError = (): InternalError => ({
  success: false,
  resultType: 'InternalError'
})

export const inputSchema = z.object({
  metadata: z.object({
    requestId: z.string(),
    sessionId: z.string().optional()
  }),
  tags: z.object({}).optional()
})