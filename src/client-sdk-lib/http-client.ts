import { HttpClient } from "./types";

export type HeaderGetter = () => Promise<Record<string, string>>

export const createHttpClient = (baseUrl: string, getCustomHeaders?: HeaderGetter): HttpClient => async (route: string, init?: RequestInit): Promise<Response> => {
  const customHeaders = getCustomHeaders ? await getCustomHeaders() : {}

  return fetch(`${baseUrl}${route}`, {
    ...init,
    headers: {
      ...init?.headers,
      ...customHeaders,
    }
  })
}