
import path from 'path';
import { generateClientSdk } from "../src/client-sdk-generator"
import { generateOpenApiSpec } from "../src/openapi-spec-generator"
import { router } from "./router"
import contracts from './contracts';

const getLocalPath = (filename: string) => {
  return path.join(__dirname, filename)
}

generateClientSdk(router.getConfiguredRoutes(), getLocalPath('contracts.ts'), {
  Prod: { url: 'http://localhost:3001' },
  Dev: { url: 'http://localhost:3001' }
}, getLocalPath('sdk-build'))

generateOpenApiSpec(router.getConfiguredRoutes(), contracts, getLocalPath('openapi'))
