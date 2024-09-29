import { Sdk } from "../sdk"

const sdk = new Sdk('Dev', () => Promise.resolve({}))

sdk.getCandidateById
sdk.updateCandidate()
sdk.getCandidateByEmail
sdk.getCandidateByProfileGuid()