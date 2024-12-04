import { Sdk } from './sdk-build'

const sdk = new Sdk('Dev', '', '')

sdk.getClientById({ clientId: '12345678' }, { 'x-request-id': '2222'}).then((result) => {
  if (result.success) {
    result.data.clientId
  }
})