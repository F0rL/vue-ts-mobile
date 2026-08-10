import http from '@/utils/http'
import MockAdapter from 'axios-mock-adapter'
import { registerAuthMock } from './modules/auth'
import { registerWeiXinWorkMock } from './modules/weiXinWork'

const mock: MockAdapter = new MockAdapter(http, { delayResponse: 300 })

registerAuthMock(mock)
registerWeiXinWorkMock(mock)
