import { Sdk } from './sdk-build'

const sdk = new Sdk('Dev', '', '')

sdk.getClientById({ clientId: '12345678' }, { 'x-request-id': 'uuuuu' }).then((result) => {
  if (result.success) {
    result.data.clientId
  }
})