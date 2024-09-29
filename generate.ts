import { Config, generateClientSdk } from "./generators/client-sdk-generator";
import { generateOpenApiSpec } from "./generators/openapi-spec-generator";
import * as contracts from './src/contracts'
import { router } from './src/server'

const config: Config = {
  'Dev': {
    url: 'dev.server'
  },
  'Prod': {
    url: 'prod.server'
  }
}

generateClientSdk(router.configuration(), './src/contracts.ts', config, './sdk');
generateOpenApiSpec(router.configuration(), contracts, './openapi');

const temp = contracts['candidateSchema'];
