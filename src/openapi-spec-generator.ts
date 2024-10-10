import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
  RouteConfig
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import fs from 'fs'
import path from 'path'
import { RouteWithHttpMethod, RoutesWithHttpMethod, statusResultMap } from './router';
import { HttpMethod, ReasonType } from './client-sdk-lib/types';

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

export const generateOpenApiSpec = <ContractTypes extends Record<string, z.AnyZodObject>>(routes: RoutesWithHttpMethod<ContractTypes>, contracts: ContractTypes, outPath: string) => {
  routes.forEach((route: RouteWithHttpMethod<ContractTypes>) => {
    registry.registerPath({
      path: route.path,
      method: getOpenApiMethod(route.method),
      summary: route.summary,
      request: {
        params: contracts[route.inputSchema],
      },
      responses: {
        ...getOpenApiResponses(route, contracts)
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

const getOpenApiMethod = (method: HttpMethod): RouteConfig['method'] => {
  switch(method) {
    case 'GET': return 'get';
    case 'POST': return 'post';
    case 'PUT': return 'put';
    case 'DELETE': return 'delete';
  }
}

const getOpenApiResponses = <ContractTypes extends Record<string, z.AnyZodObject>>(route: RouteWithHttpMethod<ContractTypes>, contracts: ContractTypes): RouteConfig['responses'] => {
  return route.resultTypes.reduce((responses: RouteConfig['responses'], resultType: ReasonType): RouteConfig['responses'] => {
    const statusCode = resultType === 'Success' ? statusResultMap['Success'][route.method] : statusResultMap[resultType];

    if(statusCode === 200 || statusCode === 201) {
      return {
        ...responses,
        [statusCode]: {
          description: '',
          content: {
            'application/json': {
              schema: contracts[route.outputSchema]
            }
          }
        }
      }
    }

    return {
      ...responses,
      [statusCode]: {
        description: ''
      }
    }
  }, {})
}