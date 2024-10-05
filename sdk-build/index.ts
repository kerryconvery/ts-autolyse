// Generated code, do not modify
import { z } from 'zod';
import { invokeRoute } from './client';
import { createHttpClient, HeaderGetter } from './http-client';
import { Environment, HttpClient, Success, NotFound, ServerError, ValidationError } from './types';
import * as contracts from './contracts';
type GetClientByIdInput = z.infer<typeof contracts.clientInputSchema>;
type GetClientByIdOutput = z.infer<typeof contracts.clientOutputSchema>;
export class Sdk {
    private client: HttpClient;
    constructor(environment: Environment, getCustomHeaders: HeaderGetter) {
        this.client = createHttpClient(environment === 'Dev' ? '' : '', getCustomHeaders);
    }
    /**
    * gets the client with the provided client id
    *
    */
    public getClientById(input: GetClientByIdInput): Promise<Success<GetClientByIdOutput> | NotFound | ServerError | ValidationError> {
        const result = invokeRoute(this.client, '/:clientid', 'GET', input, contracts.clientInputSchema);
        return result as Promise<Success<GetClientByIdOutput> | NotFound | ServerError | ValidationError>;
    }
}
