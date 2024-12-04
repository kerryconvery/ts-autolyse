import { z, ZodDiscriminatedUnionOption } from 'zod';
import { HttpClient, HttpMethod, noContent, notFound, Result, internalError, content, validationError } from './types';

type RouteMethod = (client: HttpClient, apiUrl: string, payload: Record<string, unknown>) => Promise<Result<unknown>>

export const invokeRoute = async (
  client: HttpClient,
  routePath: string,
  httpMethod: HttpMethod,
  input: Record<string, unknown>,
  inputSchema: z.AnyZodObject | z.ZodDiscriminatedUnion<string, ZodDiscriminatedUnionOption<string>[]>,
  headers?: Record<string, unknown>,
  inputHeadersSchema?: z.AnyZodObject
): Promise<Result<unknown>> => {
  const parsedInput = inputSchema.safeParse(input);

  if (parsedInput.success) {
    const [apiUrl, usedFields] = buildUrl(routePath, parsedInput.data);
    const requestData = omit(parsedInput.data, usedFields);
    const routeHandler = getRouteHandler(httpMethod)

    return routeHandler(client, apiUrl, requestData)
  }

  return validationError(parsedInput.error.message)
}

const getRouteHandler = (httpMethod: HttpMethod): RouteMethod => {
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

const postHandler = async (client: HttpClient, apiUrl: string, payload: Record<string, unknown>): Promise<Result<unknown>> => {
  const response = await client(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return httpResponseToResult(response);
}

const getHandler = async (client: HttpClient, apiUrl: string): Promise<Result<unknown>> => {
  const response = await client(apiUrl, {
    method: 'GET',
    headers: { 'Accept-Type': 'application/json' },
  })

  return httpResponseToResult(response);
}

const putHandler = async (client: HttpClient, apiUrl: string, payload: Record<string, unknown>): Promise<Result<unknown>> => {
  const response = await client(apiUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return httpResponseToResult(response);
}

const deleteHandler = async (client: HttpClient, apiUrl: string): Promise<Result<unknown>> => {
  const response = await client(apiUrl, { method: 'DELETE' });

  return httpResponseToResult(response);
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

const httpResponseToResult = async (response: Response): Promise<Result<unknown>> => {  
  if (response.status === 200) {
    return response.json().then((data) => content(data))
  }

  if (response.status === 201) {
    return response.json().then((data) => content(data))
  }

  if (response.status === 204) {
    return content(noContent)
  }

  if (response.status === 404) {
    return notFound()
  }

  if (response.status === 422) {
    return response.json().then((message: string) => validationError(message))
  }

  return internalError();
}