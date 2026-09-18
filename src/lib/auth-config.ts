/** 只有显式开启且处于开发环境时才允许模拟认证。 */
export function isMockAuthEnabled() {
  return process.env.NODE_ENV === 'development' && process.env.USE_MOCK_DB === 'true'
}

/** 缺少配置时停止认证，禁止使用公开的备用密钥。 */
export function requireAuthSecret(name: 'JWT_SECRET' | 'JWT_RESET_SECRET' = 'JWT_SECRET') {
  const secret = process.env[name]
  if (!secret || secret.trim().length < 32 || /fallback|your[-_ ]|change[-_ ]|replace[-_ ]/i.test(secret)) {
    throw new Error('认证密钥未正确配置')
  }
  return secret
}
