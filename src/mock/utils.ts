export function makeResp(msg: unknown, code = 0, total = 0): object {
  return {
    flag: code === 0,
    code,
    msg,
    total,
    time: new Date().toISOString(),
  }
}
