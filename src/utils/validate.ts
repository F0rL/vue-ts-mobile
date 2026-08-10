/**
 * Validate email
 */
export function isEmail(str: string): boolean {
  const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return reg.test(str)
}

/**
 * Validate mobile phone (China)
 */
export function isMobile(str: string): boolean {
  const reg = /^1[3-9]\d{9}$/
  return reg.test(str)
}

/**
 * Validate URL
 */
export function isURL(str: string): boolean {
  const reg = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i
  return reg.test(str)
}

/**
 * Validate ID card (China)
 */
export function isIdCard(str: string): boolean {
  const reg = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
  return reg.test(str)
}
