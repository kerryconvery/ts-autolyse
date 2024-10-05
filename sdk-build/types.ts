export type Environment = 'Dev' | 'Prod' 
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
export const noContent = null;

export type Success<T> = {
  success: true,
  reason: 'Success'
  data: T | typeof noContent
}

export type NotFound = {
  success: false,
  reason: 'NotFound'
}

export type ValidationError = {
  success: false,
  reason: 'ValidationError',
  message: string
}

export type ServerError = {
  success: false,
  reason: 'ServerError'
}

export type Headers = {
  authorization?: string,
  requestId?: string,
  sessionId?: string,
}

export type Result<T> = Success<T> | NotFound | ValidationError | ServerError
export type ReasonType = Result<any>['reason'] extends infer Reason ? Reason : never

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

export const validationError = (message: string): ValidationError => ({
  success: false,
  reason: 'ValidationError',
  message
})

export const serverError = (): ServerError => ({
  success: false,
  reason: 'ServerError'
})
