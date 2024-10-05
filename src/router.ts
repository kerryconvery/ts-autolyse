import KoaRouter from "koa-router"
import { z } from "zod";
import { HttpMethod, ReasonType, Result } from './client-sdk-lib/types'
import { Context } from "koa";

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

type ResultType<C extends Contracts, R extends RouteWithoutMethod<C>> = Extract<Result<z.infer<C[R['outputSchema']]>>, { reason: R['resultTypes'][number] }>
type RouteHandler<C extends Contracts, R extends RouteWithoutMethod<C>> = (input: z.infer<C[R['inputSchema']]>)  => Promise<ResultType<C, R>>

export class Router<C extends Contracts> {
  private internalRouter;
  private configuredRoutes: Routes<C> = []

  private addRoute(route: RouteWithoutMethod<C>, method: HttpMethod) {
    this.configuredRoutes.push({
      ...route,
      method,
    })
  }

  private handlerProxy<R extends RouteWithoutMethod<C>>(handler: RouteHandler<C, R>) {
     return (context: Context): Promise<void> => {
      return Promise.resolve()
     }
  }

  constructor(router: KoaRouter) {
    this.internalRouter = router
  }

  get<R extends RouteWithoutMethod<C>>(route: R, handler: RouteHandler<C, R>): void {
    this.addRoute(route, 'GET');
    this.internalRouter.get(route.path, this.handlerProxy(handler))
  }

  post<R extends RouteWithoutMethod<C>>(route: R, handler: RouteHandler<C, R>): void {
    this.addRoute(route, 'POST');
    this.internalRouter.post(route.path, this.handlerProxy(handler))
  }

  put<R extends RouteWithoutMethod<C>>(route: R, handler: RouteHandler<C, R>): void {
    this.addRoute(route, 'PUT');
    this.internalRouter.put(route.path, this.handlerProxy(handler))
  }

  delete<R extends RouteWithoutMethod<C>>(route: R, handler: RouteHandler<C, R>): void {
    this.addRoute(route, 'DELETE');
    this.internalRouter.delete(route.path, this.handlerProxy(handler))
  }

  routes(): KoaRouter.IMiddleware<any, {}> {
    return this.internalRouter.routes()
  }

  getConfiguredRoutes(): Routes<C> {
    return this.configuredRoutes
  }
}
