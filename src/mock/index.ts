import http from '@/utils/http'
import MockAdapter from 'axios-mock-adapter'
import { registerAuthMock } from './modules/auth'
import { registerSysMenuMock } from './modules/sysMenu'
import { registerSysRoleMock } from './modules/sysRole'
import { registerSysUserMock } from './modules/sysUser'
import { registerSysOrgMock } from './modules/sysOrg'
import { registerSysLogMock } from './modules/sysLog'

const mock: MockAdapter = new MockAdapter(http, { delayResponse: 300 })

registerAuthMock(mock)
registerSysMenuMock(mock)
registerSysRoleMock(mock)
registerSysUserMock(mock)
registerSysOrgMock(mock)
registerSysLogMock(mock)
