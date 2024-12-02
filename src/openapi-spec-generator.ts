import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  ResponseConfig,
  RouteConfig,
  extendZodWithOpenApi
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import fs from 'fs'
import path from 'path'
import { Route, Routes, statusResultMap } from './router';
import { Environment, HttpMethod, ResultType } from './client-sdk-lib/types';

export type Config = {
  [key in Environment]: {
    url: string
  }
}

extendZodWithOpenApi(z)

const registry = new OpenAPIRegistry();

export const generateOpenApiSpec = <ContractTypes extends Record<string, z.AnyZodObject>>(
  title: string,
  description: string,
  routes: Routes<ContractTypes>,
  contracts: ContractTypes,
  config: Config,
  outPath: string
) => {
  routes.forEach((route: Route<ContractTypes>) => {
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
      title,
      description
    },
    servers: [{
      url: config.Prod.url,
      description: 'Production'
    },
    {
        url: config.Dev.url,
        description: 'Development'
    }],
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

const getOpenApiResponses = <ContractTypes extends Record<string, z.AnyZodObject>>(route: Route<ContractTypes>, contracts: ContractTypes): RouteConfig['responses'] => {
  return route.resultTypes.reduce((responses: RouteConfig['responses'], resultType: ResultType): RouteConfig['responses'] => {
    const statusCode = getStatusCode(resultType, route.method);

    if(statusCode === 200 || statusCode === 201) {
      return {
        ...responses,
        [statusCode]: {
          description: '',
          content: getResponeContent(route, contracts)
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

const getStatusCode = (resultType: ResultType, routeMethod: HttpMethod): number => {
  if (resultType === 'Success') {
    return statusResultMap['Success'][routeMethod]
  }

  if (resultType === 'NoContent') {
    return statusResultMap['NoContent'][routeMethod]
  }

  return statusResultMap[resultType];
}

const getResponeContent = <ContractTypes extends Record<string, z.AnyZodObject>>(route: Route<ContractTypes>, contracts: ContractTypes): ResponseConfig['content'] => {
  if (route.outputSchema) {
    return {
      'application/json': {
        schema: contracts[route.outputSchema]
      }
    }
  }
  return undefined;
}