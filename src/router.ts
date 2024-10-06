import KoaRouter from "koa-router"
import { z } from "zod";
import { Context } from "koa";
import bodyParser from 'koa-bodyparser'
import { HttpMethod, ReasonType, Result, validationError } from './types'

type Contracts = Record<string, z.ZodType>

export type Route<C extends Contracts> = {
  name: string,
  summary: string,
  method: HttpMethod
  path: string,
  inputSchema: keyof C,
  resultTypes: ReasonType[],
  outputSchema: keyof C,
  deprecated?: {
    replacement: string | null
  }
}

export type Routes<C extends Contracts> = Route<C>[]

export type RouteWithoutMethod<C extends Contracts> = Omit<Route<C>, 'method'>;

type ReturnType<C extends Contracts, R extends RouteWithoutMethod<C>> = Extract<Result<z.infer<C[R['outputSchema']]>>, { reason: R['resultTypes'][number] }>
type RouteHandler<C extends Contracts, R extends RouteWithoutMethod<C>> = (input: z.infer<C[R['inputSchema']]>)  => Promise<ReturnType<C, R>>

const statusResultMap = {
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

export class Router<C extends Contracts> {
  private internalRouter;
  private contracts: C;
  private configuredRoutes: Routes<C> = []

  private addRoute(route: RouteWithoutMethod<C>, method: HttpMethod) {
    this.configuredRoutes.push({
      ...route,
      method,
    })
  }

  // private handlerProxyForGet<R extends RouteWithoutMethod<C>>(routeConfig: RouteWithoutMethod<C>, handler: RouteHandler<C, R>) {
  //   return async (context: Context): Promise<void> => {
  //     const inputContract = this.contracts[routeConfig.inputSchema];
  //     const inputParseResult = inputContract.safeParse(context.params);

  //     if (inputParseResult.success) {
  //       const handlerResult = await handler(inputParseResult.data);

  //       this.presentResult(context, 'GET', handlerResult)
  //     }
  //   }
  // }
  
  // private handlerProxyForPost<R extends RouteWithoutMethod<C>>(routeConfig: RouteWithoutMethod<C>, handler: RouteHandler<C, R>) {
  //   return async (context: Context): Promise<void> => {
  //     const inputContract = this.contracts[routeConfig.inputSchema];
  //     const inputParseResult = inputContract.safeParse({
  //       ...context.params,
  //       ...this.getBodyFromContext(context),
  //     });

  //     if (inputParseResult.success) {
  //       const handlerResult = await handler(inputParseResult.data);

  //       this.presentResult(context, 'POST', handlerResult)
  //     }
  //   }
  // }

  // private handlerProxyForPut<R extends RouteWithoutMethod<C>>(routeConfig: RouteWithoutMethod<C>, handler: RouteHandler<C, R>) {
  //   return async (context: Context): Promise<void> => {
  //     const inputContract = this.contracts[routeConfig.inputSchema];

  //     const inputParseResult = inputContract.safeParse({
  //       ...context.params,
  //       ...this.getBodyFromContext(context),
  //     });

  //     if (inputParseResult.success) {
  //       const handlerResult = await handler(inputParseResult.data);

  //       this.presentResult(context, 'PUT', handlerResult)
  //     }
  //   }
  // }

  // private handlerProxyForDelete<R extends RouteWithoutMethod<C>>(routeConfig: RouteWithoutMethod<C>, handler: RouteHandler<C, R>) {
  //   return async (context: Context): Promise<void> => {
  //     const inputContract = this.contracts[routeConfig.inputSchema];
  //     const inputParseResult = inputContract.safeParse(context.params);

  //     if (inputParseResult.success) {
  //       const handlerResult = await handler(inputParseResult.data);

  //       this.presentResult(context, 'DELETE', handlerResult)
  //     }
  //   }
  // }

  private handlerProxy<R extends RouteWithoutMethod<C>>(routeConfig: RouteWithoutMethod<C>, method: HttpMethod, handler: RouteHandler<C, R>) {
    return async (context: Context): Promise<void> => {
      const inputSchema = this.contracts[routeConfig.inputSchema];
      const inputParseResult = inputSchema.safeParse({
        ...context.params,
        ...this.getBodyFromContext(context),
      });

      if (!inputParseResult.success) {
        this.presentResult(context, method, validationError(inputParseResult.error.message))
        return;
      }

      const handlerResult = await handler(inputParseResult.data);

      this.presentResult(context, method, handlerResult);
    }
  }

  private getBodyFromContext(context: Context): Record<string, unknown> {
    if (!context.request.body) {
      return {}
    }

    const bodySchema = z.record(z.string(), z.any());
    const bodyParseResult = bodySchema.safeParse(context.request.body);

    return bodyParseResult.success ? bodyParseResult.data : {}
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

  constructor(router: KoaRouter, contracts: C) {
    this.internalRouter = router;
    this.contracts = contracts;

    this.setRouterMiddleware(router);
  }

  get<R extends RouteWithoutMethod<C>>(route: R, handler: RouteHandler<C, R>): void {
    this.addRoute(route, 'GET');
    this.internalRouter.get(route.path, this.handlerProxy(route, 'GET', handler))
  }

  post<R extends RouteWithoutMethod<C>>(route: R, handler: RouteHandler<C, R>): void {
    this.addRoute(route, 'POST');
    this.internalRouter.post(route.path, this.handlerProxy(route, 'POST', handler))
  }

  put<R extends RouteWithoutMethod<C>>(route: R, handler: RouteHandler<C, R>): void {
    this.addRoute(route, 'PUT');
    this.internalRouter.put(route.path, this.handlerProxy(route, 'PUT', handler))
  }

  delete<R extends RouteWithoutMethod<C>>(route: R, handler: RouteHandler<C, R>): void {
    this.addRoute(route, 'DELETE');
    this.internalRouter.delete(route.path, this.handlerProxy(route, 'DELETE', handler))
  }

  routes(): KoaRouter.IMiddleware<any, {}> {
    return this.internalRouter.routes()
  }

  getConfiguredRoutes(): Routes<C> {
    return this.configuredRoutes
  }
}
