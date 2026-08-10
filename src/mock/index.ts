import http from '@/utils/http'
import MockAdapter from 'axios-mock-adapter'
import { registerAuthMock } from './modules/auth'

const mock: MockAdapter = new MockAdapter(http, { delayResponse: 300 })

registerAuthMock(mock)
