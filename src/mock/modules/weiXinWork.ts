import type MockAdapter from 'axios-mock-adapter'
import { makeResp } from '../utils'

export function registerWeiXinWorkMock(mock: MockAdapter) {
  mock.onGet('/api/WeiXinWork/GetTokenByUserId').reply((config) => {
    const { userid } = config.params || {}
    if (userid === 'admin') {
      return [200, makeResp(`mock-token-${Date.now()}`)]
    }
    return [200, makeResp('用户名或密码错误', 400)]
  })
}
