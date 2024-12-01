
import path from 'path';
import { generateClientSdk } from "../src/client-sdk-generator"
import { generateOpenApiSpec } from "../src/openapi-spec-generator"
import { router } from "./router"
import contracts from './contracts';

const getLocalPath = (filename: string) => {
  return path.join(__dirname, filename)
}

const config = {
  Prod: { url: 'http://localhost:3001' },
  Dev: { url: 'http://localhost:3001' }
}

generateClientSdk(router.getConfiguredRoutes(), getLocalPath('contracts.ts'), config, getLocalPath('sdk-build'))
generateOpenApiSpec('', '', router.getConfiguredRoutes(), contracts, config, getLocalPath('openapi'));