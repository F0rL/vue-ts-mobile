import { config } from '@/config'

const PREFIX = config.BASE_URL as string

export const storageKey = (name: string): string => `${PREFIX}${name}`

export default storageKey
