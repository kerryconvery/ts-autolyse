import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

export { generateClientSdk, Config } from './client-sdk-generator'
export { generateOpenApiSpec } from './openapi-spec-generator'
export { Router, Route } from './router'
export {
  Environment,
  Content as Success,
  NotFound,
  ValidationError,
  InternalError as ServerError,
  content as success,
  notFound,
  validationError,
  internalError as serverError,
  noContent
} from './client-sdk-lib/types'
export const extendZod = (zod: typeof z) => extendZodWithOpenApi(zod)