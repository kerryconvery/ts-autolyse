import { z } from 'zod';
import { HttpClient, HttpMethod, noContent, Result, serverError, success, validationError } from './types';

type RouteMethod<Output> = (client: HttpClient, apiUrl: string, payload: Record<string, unknown>) => Promise<Result<Output>>

export const invokeRoute = async <Output>(client: HttpClient, routePath: string, httpMethod: HttpMethod, input: Record<string, unknown>, inputSchema: z.AnyZodObject): Promise<Result<Output>> => {
  const parsedInput = inputSchema.safeParse(input);

  if (parsedInput.success) {
    const [apiUrl, usedFields] = buildUrl(routePath, parsedInput.data);
    const requestData = omit(parsedInput.data, usedFields);
    const routeHandler = getRouteHandler<Output>(httpMethod)

    return routeHandler(client, apiUrl, requestData)
  }

  return validationError(parsedInput.error.message)
}

const getRouteHandler = <Output>(httpMethod: HttpMethod): RouteMethod<Output> => {
  switch(httpMethod) {
    case 'POST': {
      return postHandler
    }
    case 'GET': {
      return getHandler
    }
    case 'PUT': {
      return putHandler
    }
    case 'DELETE': {
      return deleteHandler
    }
  }
}

const postHandler = async <Output>(client: HttpClient, apiUrl: string, payload: Record<string, unknown>): Promise<Result<Output>> => {
  const response = await client(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (response.status === 201) {
    return response.json().then((data) => success(data))
  }

  return serverError()
}

const getHandler = async <Output>(client: HttpClient, apiUrl: string): Promise<Result<Output>> => {
  const response = await client(apiUrl, {
    method: 'GET',
    headers: { 'Accept-Type': 'application/json' },
  })

  if (response.status === 200) {
    return response.json().then((data) => success(data))
  }

  return serverError()
}

const putHandler = async <Output>(client: HttpClient, apiUrl: string, payload: Record<string, unknown>): Promise<Result<Output>> => {
  const response = await client(apiUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (response.status === 200) {
    return success(noContent)
  }

  return serverError()
}

const deleteHandler = async <Output>(client: HttpClient, apiUrl: string): Promise<Result<Output>> => {
  const response = await client(apiUrl, { method: 'DELETE' })

  if (response.status === 204) {
    return success(noContent)
  }

  return serverError()
}

const buildUrl = (route: string, inputData: Record<string, unknown>): [string, string[]] => {
    return Object.entries(inputData).reduce(([replacedUrl, usedFields]: [string, string[]], [parameterName, parameterValue]: [string, any]): [string, string[]] => {
      const newUrl = replacedUrl.replace(`:${parameterName}`, parameterValue);

      if (newUrl !== replacedUrl) {
        return [newUrl, usedFields.concat(parameterName)]
      }

      return [replacedUrl, usedFields]
    }, [route, []]);
  }

const omit = (value: Record<string, unknown>, fieldsToOmit: string[]) => {
  return Object.entries(value).reduce((acc: Record<string, unknown>, [key, value]: [string, unknown]) => {
    if (fieldsToOmit.includes(key)) {
      return acc;
    }

    return {
      ...acc,
      [key]: value
    }
  }, {})
}