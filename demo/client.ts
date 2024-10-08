import { Sdk } from './sdk-build'

const sdk = new Sdk('Dev', () => Promise.resolve({
  'x-seek-requestid': 'request-id',
  'x-seek-sessionid': 'session-id'
}))

sdk.getClientById({ clientId: '454545' }).then((result) => console.log(result))