// import { Router, RouterConfig } from './router'
// import KoaRouter from 'koa-router'
// import * as contracts from './contracts'
// import { z } from 'zod';
// import { NotFound, Result, ServerError, Success, ValidationError, validationError } from './client-sdk-lib/types';

// type Contracts = typeof contracts;

// type ContractTypes = {
//   inputType: z.ZodType
// }

// const contractTypes = {
//   inputType: contracts.clientInputSchema
// } satisfies ContractTypes

// const getTypedInput = <T extends ContractTypes>(config: T): (input: z.infer<T['inputType']>) => void => {
//   const fn = (input: z.infer<typeof config.inputType>): void => {

    
//   }

//   return fn as (input: z.infer<T['inputType']>) => void
// }

// const typedInput = getTypedInput<typeof contractTypes>(contractTypes);


// typedInput({

// })



// const c: Contracts = {
//   'clientInputSchema':  z.object({
//     lastName: z.string()
//   })
// }

// c.clientInputSchema

// export const router = new Router<Contracts>(new KoaRouter());

// const config = {
//   method: 'DELETE',
//   summary: 'gets the client with the provided client id',
//   path: '/:clientid',
//   inputSchema: 'clientOutputSchema',
//   outputSchema: 'clientOutputSchema',
//   resultTypes: ['Success', 'NotFound', 'ServerError']
// } satisfies RouterConfig<Contracts>

// type ClientConfig<I extends keyof Contracts, O extends keyof Contracts> = RouterConfig<Contracts> & {
//   inputSchema: Contracts[I],
//   outputSchema: O,
// }

// const client: ClientConfig<'clientInputSchema', 'clientOutputSchema'> = {
//   method: 'DELETE',
//   summary: 'gets the client with the provided client id',
//   path: '/:clientid',
//   outputSchema: 'clientOutputSchema',
//   resultTypes: ['Success', 'NotFound', 'ServerError']
// }

// const getInputType = <T extends RouterConfig<Contracts>, I extends keyof Contracts>(config: T, schemaName: I) => {
//   return (input: z.infer<Contracts[Extract<I, T['inputSchema']>]>): void => {
//     console.log(input)
//   }
// }

// const fn = getInputType(config, config.inputSchema)

// fn()

// // const routeConfig = {
// //   name: 'getClientById',
// //   summary: 'gets the client with the provided client id',
// //   path: '/:clientid',
// //   inputSchema: 'clientInputSchema',
// //   outputSchema: 'clientOutputSchema',
// //   resultTypes: ['Success', 'ServerError', 'ValidationError']
// // } satisfies Route<Contracts>

// const getHandler = ({ clientId: string }): Promise<Success<{ lastName: string }> | NotFound | ServerError | ValidationError> => {
//   return Promise.resolve(validationError())
// }

// router.get({
//   name: 'getClientById',
//   summary: 'gets the client with the provided client id',
//   path: '/:clientid',
//   inputSchema: 'clientInputSchema',
//   outputSchema: 'clientOutputSchema',
//   resultTypes: ['Success', 'NotFound', 'ServerError', 'ValidationError']
// } ,  getHandler)


//   type Types = {
//     str: string,
//     num: number,
//     bool: boolean
//   }

//   function getTypeFn<TypeMap extends Types, TypeKey extends keyof TypeMap>(typeMap: TypeMap, key: TypeKey) {
//     return (input: TypeMap[TypeKey]) => {

//     }
//   }

//   const types: Types = {
//     str: 'sting',
//     num: 1,
//     bool: true
//   }

//   const typefn = getTypeFn(types, 'str');


//   typefn()


// type Product =
//   | { type: "book"; author: string }
//   | { type: "movie"; producer: string }
//   | { type: "appliance"; manufacturer: string }

//   function filterProducts<T extends Product, U extends T["type"]>(
//     products: T[],
//     type: U,
//   ) {
//     return products.filter(
//       (item): item is Extract<T, Record<"type", U>> => item.type === type,
//     )
//   }

//   const products: Product[] = [
//     { type: "book", author: 'me' },
//     { type: "movie", producer: 'myself' },
//     { type: "appliance", manufacturer: 'I' },
//   ]
  
//   const dddd = filterProducts(products, 'movie')

// type ExtractResult = Result<any>['reason'] extends infer Reason ? Reason : never 

// type ReasonTypes = ExtractResult

// const reason: ReasonTypes = 'Success'


// type NewConfig = {
//   result: ReasonTypes[]
// }

// const newConfig = {
//   result: ['Success', 'NotFound']
// } satisfies NewConfig


// type ExtractedResultTypes<C extends NewConfig> = Extract<Result<any>, { reason: C['result'][number] }>


// type FinalResults = ExtractResult<typeof newConfig>

// type PPP<T, C extends NewConfig> = Extract<Result<T>, { reason: C['result'][number] }>

// type ConfigResult = PPP<string, typeof newConfig>


