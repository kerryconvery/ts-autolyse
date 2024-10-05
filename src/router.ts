import KoaRouter from "koa-router"
import { z } from "zod";
import { HttpMethod, ReasonType, Result } from './client-sdk-lib/types'
import { Context } from "koa";

type Contracts = Record<string, z.ZodType>

export type RouterConfig<C extends Contracts> = {
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

export type RouterConfigs<C extends Contracts> = {
  [key: string]: RouterConfig<C>
}

export type Route<C extends Contracts> = Omit<RouterConfig<C>, 'method'> & {
  name: string,
}

type ResultType<C extends Contracts, R extends Route<C>> = Extract<Result<z.infer<C[R['outputSchema']]>>, { reason: R['resultTypes'][number] }>
type RouteHandler<C extends Contracts, R extends Route<C>> = (input: z.infer<C[R['inputSchema']]>)  => Promise<ResultType<C, R>>

export class Router<C extends Contracts> {
  private internalRouter;
  private routerConfig: RouterConfigs<C> = {}

  private addRouterConfig(route: Route<C>, method: HttpMethod) {
    this.routerConfig = {
      ...this.routerConfig,
      
      [route.name]: {
        summary:route.summary,
        path: route.path,
        inputSchema:route.inputSchema,
        outputSchema: route.outputSchema,
        resultTypes: route.resultTypes,
        deprecated: route.deprecated,
        method,
      }
    }
  }

  private handlerProxy<R extends Route<C>>(handler: RouteHandler<C, R>) {
     return (context: Context): Promise<void> => {
      return Promise.resolve()
     }
  }

  constructor(router: KoaRouter) {
    this.internalRouter = router
  }

  get<R extends Route<C>>(route: R, handler: RouteHandler<C, R>): void {
    this.addRouterConfig(route, 'GET');
    this.internalRouter.get(route.path, this.handlerProxy(handler))
  }

  post<R extends Route<C>>(route: R, handler: RouteHandler<C, R>): void {
    this.addRouterConfig(route, 'POST');
    this.internalRouter.post(route.path, this.handlerProxy(handler))
  }

  put<R extends Route<C>>(route: R, handler: RouteHandler<C, R>): void {
    this.addRouterConfig(route, 'PUT');
    this.internalRouter.put(route.path, this.handlerProxy(handler))
  }

  delete<R extends Route<C>>(route: R, handler: RouteHandler<C, R>): void {
    this.addRouterConfig(route, 'DELETE');
    this.internalRouter.delete(route.path, this.handlerProxy(handler))
  }

  routes(): KoaRouter.IMiddleware<any, {}> {
    return this.internalRouter.routes()
  }

  configuration(): RouterConfigs<C> {
    return this.routerConfig
  }
}
