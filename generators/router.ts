import KoaRouter from "koa-router"
import { HttpMethod, ReasonType, RouterConfig } from "./types"
import { z } from "zod";

export type Route<ContractTypes extends Record<string, z.ZodType>> = {
  name: string,
  summary: string,
  path: string,
  inputSchema: keyof ContractTypes,
  resultTypes: ReasonType[],
  outputSchema: keyof ContractTypes,
  deprecated?: {
    replacement: string | null
  }
}

export class Router<Contracts extends Record<string, z.ZodType>> {
  private internalRouter;
  private routerConfig: RouterConfig<Contracts> = {}

  private addRouterConfig(route: Route<Contracts>, method: HttpMethod) {
    this.routerConfig = {
      ...this.routerConfig,
      [route.name]: {
        ...route,
        method,
      }
    }
  }

  constructor(router: KoaRouter) {
    this.internalRouter = router
  }

  get(route: Route<Contracts>, handler: () => void): void {
    this.addRouterConfig(route, 'GET');
    this.internalRouter.get(route.path, handler)
  }

  post(route: Route<Contracts>, handler: () => void): void {
    this.addRouterConfig(route, 'POST');
    this.internalRouter.post(route.path, handler)
  }

  put(route: Route<Contracts>, handler: () => void): void {
    this.addRouterConfig(route, 'PUT');
    this.internalRouter.put(route.path, handler)
  }

  delete(route: Route<Contracts>, handler: () => void): void {
    this.addRouterConfig(route, 'DELETE');
    this.internalRouter.delete(route.path, handler)
  }

  routes(): KoaRouter.IMiddleware<any, {}> {
    return this.internalRouter.routes()
  }

  configuration(): RouterConfig<Contracts> {
    return this.routerConfig
  }
}