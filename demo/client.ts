import { Sdk } from './sdk-build'

const sdk = new Sdk('Dev', '', '')

sdk.getClientById({ clientId: '12345678', metadata: { requestId: 'xxxx'}}).then((result) => {
  if (result.success) {
    result.data.clientId
  }
})