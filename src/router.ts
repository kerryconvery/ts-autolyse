import KoaRouter from "koa-router"
import { z } from "zod";
import { Context } from "koa";
import bodyParser from 'koa-bodyparser'
import { HttpMethod, ReasonType, Result, success, Success, ValidationError, validationError } from './client-sdk-lib/types'

export type Contracts = Record<string, z.AnyZodObject>
export type Replaced = {
  replacement: string
}
export type Deprecated = Replaced | true

export type Route<C extends Contracts> = {
  name: string,
  summary: string,
  method: HttpMethod
  path: string,
  headerSchema?: keyof C,
  inputSchema: keyof C,
  resultTypes: ReasonType[],
  outputSchema: keyof C,
  deprecated?: Deprecated,
}

export type Routes<C extends Contracts> = Route<C>[]

type InputType<C extends Contracts, R extends Route<C>> = z.infer<C[R['inputSchema']]>
type HeaderType<C extends Contracts, R extends Route<C>> = R['headerSchema'] extends keyof C ? z.infer<C[R['headerSchema']]> : {}
type ReturnType<C extends Contracts, R extends Route<C>> = Extract<Result<z.infer<C[R['outputSchema']]>>, { reason: R['resultTypes'][number] }>
type RouteHandler<C extends Contracts, R extends Route<C>> = (input: InputType<C, R>, headers: HeaderType<C, R>) => Promise<ReturnType<C, R>>

export const statusResultMap = {
  'Success': {
    'GET': 200,
    'POST': 201,
    'PUT': 200,
    'DELETE': 204
  },
  'NotFound': 404,
  'ValidationError': 422,
  'ServerError': 500
}

export type RouterOptions = {
  routePrefix?: string
}

export class Router<C extends Contracts> {
  private internalRouter;
  private options: Required<RouterOptions>
  private contracts: C;
  private configuredRoutes: Route<C>[] = []

  private addRoute(route: Route<C>) {
    this.configuredRoutes.push({
      ...route,
      resultTypes: [...route.resultTypes, 'ValidationError']
    })
  }

  private handlerProxy<R extends Route<C>>(routeConfig: Route<C>, handler: RouteHandler<C, R>) {
    return async (context: Context): Promise<void> => {
      const headersResult = this.getHeadersFromContext(context, routeConfig);
      const inputResult = this.getInputFromContext(context, routeConfig);

      if (!inputResult.success) {
        return this.presentResult(context, routeConfig.method, inputResult);
      }

      if (!headersResult.success) {
        return this.presentResult(context, routeConfig.method, headersResult);
      }

      const handlerResult = await handler(inputResult.data, headersResult.data);

      return this.presentResult(context, routeConfig.method, handlerResult);
    }
  }

  private getInputFromContext(context: Context, routeConfig: Route<C>): Success<Record<string, unknown>> | ValidationError {
    const inputSchema = this.contracts[routeConfig.inputSchema];
    const inputParseResult = inputSchema.safeParse({
      ...context.params,
      ...this.getBodyFromContext(context),
    });

    if (!inputParseResult.success) {
      return validationError(`input: ${inputParseResult.error.message}`)
    }

    return success(inputParseResult.data)
  }

  private getBodyFromContext(context: Context): Record<string, unknown> {
    if (!context.request.body) {
      return {}
    }

    const bodySchema = z.record(z.string(), z.any());
    const bodyParseResult = bodySchema.safeParse(context.request.body);

    return bodyParseResult.success ? bodyParseResult.data : {}
  }

  private getHeadersFromContext(context: Context, routeConfig: Route<C>): Success<Record<string, unknown>> | ValidationError {
    if (!routeConfig.headerSchema) {
      return success({})
    }

    const headerSchema = this.contracts[routeConfig.headerSchema];
    const headerParseResult =  headerSchema.safeParse(context.headers);

    if (!headerParseResult.success) {
      return validationError(`headers: ${headerParseResult.error.message}`)
    }

    return success(headerParseResult.data)
  }

  private presentResult(context: Context, method: HttpMethod, result: Result<unknown>): void {
    if (result.reason === 'Success') {
      context.body = result.data ?? undefined;
      context.status = statusResultMap['Success'][method];
      return;
    }

    if (result.reason === 'ValidationError') {
      context.body = result.message;
      context.status = statusResultMap['ValidationError'];
      return;
    }

    context.status = statusResultMap[result.reason];
  }

  private setRouterMiddleware(router: KoaRouter) {
    router.use(bodyParser({
      enableTypes: ['json']
    }))
  }

  constructor(contracts: C, options: RouterOptions = {}) {
    this.internalRouter = new KoaRouter();
    this.contracts = contracts;
    this.options = {
      routePrefix: options.routePrefix ?? '/',
    }
    this.setRouterMiddleware(this.internalRouter);
  }

  add<R extends Route<C>>(route: R, handler: RouteHandler<C, R>): void {
    this.addRoute(route);

    if (route.method === 'GET') {
      this.internalRouter.get(`${this.options.routePrefix}${route.path}`, this.handlerProxy(route, handler))
    }

    if(route.method === 'POST') {
      this.internalRouter.post(`${this.options.routePrefix}${route.path}`, this.handlerProxy(route, handler))
    }

    if (route.method === 'PUT') {
      this.internalRouter.put(`${this.options.routePrefix}${route.path}`, this.handlerProxy(route, handler))
    }

    if(route.method === 'DELETE') {
      this.internalRouter.delete(`${this.options.routePrefix}${route.path}`, this.handlerProxy(route, handler))
    }
  }

  routes(): KoaRouter.IMiddleware<any, {}> {
    return this.internalRouter.routes()
  }

  getConfiguredRoutes(): Route<C>[] {
    return this.configuredRoutes
  }
}
