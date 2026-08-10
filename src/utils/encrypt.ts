import pki from 'node-forge/lib/pki.js'
import util from 'node-forge/lib/util.js'
import md5 from 'node-forge/lib/md5.js'
import cipher from 'node-forge/lib/cipher.js'
import random from 'node-forge/lib/random.js'
import pbkdf2 from 'node-forge/lib/pbkdf2.js'

const PROD_PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCAUSr2fQ0oLS02aRzxjXDhxBYu
UYteGEw1AmZFveB3NzmSWMhXNkKn35gSulKxgMY9mSfnuSbIayEHQe8v7sHPIHv7
9V1jHqnRZrCiC7+twMh/49Z5tWW9FMh8YrSsdkaZ712vS6i9Of7aIePLB/QdFIMw
Ybp7B3zGs6iWuzMM2QIDAQAB
-----END PUBLIC KEY-----`

const publicKey = pki.publicKeyFromPem(PROD_PUBLIC_KEY_PEM)

export function encryptPwdRsa(password: string): string {
  return util.encode64(publicKey.encrypt(util.encodeUtf8(password)))
}

export function md5Hash(text: string): string {
  const hash = md5.create()
  return hash.update(text).digest().toHex().toUpperCase()
}

/**
 * 通用对称加密（AES-256-CBC + PBKDF2-SHA256）
 *
 * 每次加密生成随机 salt 与随机 IV，密文格式：base64(salt).base64(iv).base64(ciphertext)
 * 可用于任何需要本地可逆加密的业务场景，传入业务专属 passphrase 即可。
 */
const PBKDF2_ITERATIONS = 10000
const KEY_LENGTH = 32 // 256-bit AES
const IV_LENGTH = 16 // AES block size
const SALT_LENGTH = 16

export function encryptText(plaintext: string, passphrase: string): string {
  const salt = random.getBytesSync(SALT_LENGTH)
  const iv = random.getBytesSync(IV_LENGTH)
  const key = pbkdf2(util.encodeUtf8(passphrase), salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256')
  const c = cipher.createCipher('AES-CBC', key)
  c.start({ iv })
  c.update(util.createBuffer(plaintext, 'utf8'))
  c.finish()
  return [util.encode64(salt), util.encode64(iv), util.encode64(c.output.getBytes())].join('.')
}

export function decryptText(encrypted: string, passphrase: string): string {
  const parts = encrypted.split('.')
  if (parts.length !== 3) throw new Error('Invalid encrypted format')
  const salt = util.decode64(parts[0])
  const iv = util.decode64(parts[1])
  const ciphertext = util.decode64(parts[2])
  const key = pbkdf2(util.encodeUtf8(passphrase), salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256')
  const d = cipher.createDecipher('AES-CBC', key)
  d.start({ iv })
  d.update(util.createBuffer(ciphertext))
  d.finish()
  return d.output.toString('utf8')
}
