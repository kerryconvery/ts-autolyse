
import path from 'path';
import { generateClientSdk } from "../src/client-sdk-generator"
import { generateOpenApiSpec } from "../src/openapi-spec-generator"
import { router } from "./demo"
import contracts from './contracts';

const getLocalPath = (filename: string) => {
  return path.join(__dirname, filename)
}

generateClientSdk(router.getConfiguredRoutes(), getLocalPath('contracts.ts'), { Prod: { url: ''}, Dev: { url: ''}}, getLocalPath('sdk-build'))
generateOpenApiSpec(router.getConfiguredRoutes(), contracts, getLocalPath('openapi'))
