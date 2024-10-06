import { Sdk } from './sdk-build'

const sdk = new Sdk('Dev', () => Promise.resolve({}))

sdk.getClientById({ clientId: '' })