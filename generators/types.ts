import { z } from "zod";

export type Environment = 'Dev' | 'Prod' 

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export type ReasonType = 'Success' | 'NotFound' | 'ValidationError' | 'ServerError'
export const noContent = null;

export type ReturnResult = {
  success: boolean
  reason: ReasonType
}

export type Success<T> = ReturnResult & {
  success: true,
  reason: 'Success'
  data: T | typeof noContent
}

export type NotFound = ReturnResult & {
  success: false,
  reason: 'NotFound'
}

export type ValidationError = ReturnResult & {
  success: false,
  reason: 'ValidationError'
}

export type ServerError = ReturnResult & {
  success: false,
  reason: 'ServerError'
}

export type Headers = {
  authorization?: string,
  requestId?: string,
  sessionId?: string,
}

export type Route<ContractTypes extends Record<string, z.ZodType>> = {
  summary: string,
  method: HttpMethod
  path: string,
  inputSchema: keyof ContractTypes,
  resultTypes: ReasonType[],
  outputSchema: keyof ContractTypes,
  deprecated?: boolean
}

export type RouterConfig<ContractTypes extends Record<string, z.ZodType>> = {
  [key: string]: Route<ContractTypes>
}

export type Result<T> = Success<T> | NotFound | ValidationError | ServerError

export type HttpClient = (input: string, init?: RequestInit) => Promise<Response>

export const success = <T>(data: T): Success<T> => ({
  success: true,
  reason: 'Success',
  data
})

export const notFound = (): NotFound => ({
  success: false,
  reason: 'NotFound'
})

export const validationError = (): ValidationError => ({
  success: false,
  reason: 'ValidationError'
})

export const serverError = (): ServerError => ({
  success: false,
  reason: 'ServerError'
})