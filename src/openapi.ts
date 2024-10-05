import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { Route, Router, RouterConfig, RouterConfigs } from './router';

const registry = new OpenAPIRegistry();

export const generateSpecFromRouter = <ContractTypes extends Record<string, z.ZodType>>(router: Router<ContractTypes>, contracts: ContractTypes) => {
  generateSpec(router.configuration(), contracts)
}

export const generateSpec = <ContractTypes extends Record<string, z.ZodType>>(routeDefinition: RouterConfigs<ContractTypes>, contracts: ContractTypes) => {
  Object.entries(routeDefinition).forEach(([_name, route]: [string, RouterConfig<ContractTypes>]) => {
    registry.registerPath({
      path: route.path,
      method: route.method === 'GET' ? 'get' : 'post',
      responses: {
        200: {
          description: '',
          content: {
            'application/json': {
              schema: contracts[route.outputSchema]
            }
          }
        },
        204: {
          description: ''
        }
      }
    })
  })
  const generator = new OpenApiGeneratorV3(registry.definitions);

  const document = generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'My API',
      description: 'This is the API',
    },
    servers: [{ url: 'v1' }],
  })

  console.log(JSON.stringify(document))
}