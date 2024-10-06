import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import fs from 'fs'
import path from 'path'
import { RouteWithHttpMethod, RoutesWithHttpMethod } from './router';

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

export const generateOpenApiSpec = <ContractTypes extends Record<string, z.ZodType>>(routes: RoutesWithHttpMethod<ContractTypes>, contracts: ContractTypes, outPath: string) => {
  routes.forEach((route: RouteWithHttpMethod<ContractTypes>) => {
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

  saveSpec(JSON.stringify(document), outPath);
}

const saveSpec = (spec: string, outPath: string): void => {
  if (fs.existsSync(outPath)) {
    fs.rmSync(outPath, { recursive: true })
  }

  fs.mkdirSync(outPath, { recursive: true });
  fs.writeFileSync(path.join(outPath, 'openapi.json'), spec)
}