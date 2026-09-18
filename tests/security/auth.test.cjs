const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '../..');

class Response {
  constructor(body, status) { this.body = body; this.status = status; }
  static json(body, { status = 200 } = {}) { return new Response(body, status); }
}

// 将路由真实源码编译到隔离上下文，替换数据库和邮件服务；不连接真实账户。
function load(file, env, dependencies = {}) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true
  }}).outputText;
  const module = { exports: {} };
  const mocks = { 'next/server': { NextResponse: Response }, ...dependencies };
  const localRequire = name => {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (name === '@/lib/auth-config') return load('src/lib/auth-config.ts', env);
    throw Error('测试未声明依赖: ' + name);
  };
  vm.runInNewContext(code, { module, exports: module.exports, require: localRequire,
    process: { env }, console: { log() {}, error() {} }, Buffer, URL }, { filename: file });
  return module.exports;
}

const secret = 'isolated-test-key-with-more-than-32-characters';
const request = body => ({ json: async () => body, headers: new Headers({ authorization: 'Bearer isolated-token' }), url: 'http://localhost/api' });

test('模拟认证只允许显式开启的开发环境', () => {
  for (const [env, expected] of [
    [{ NODE_ENV: 'production', USE_MOCK_DB: 'true' }, false],
    [{ NODE_ENV: 'production' }, false],
    [{ NODE_ENV: 'development' }, false],
    [{ NODE_ENV: 'development', USE_MOCK_DB: 'true' }, true],
    [{ NODE_ENV: 'test', USE_MOCK_DB: 'true' }, false]
  ]) assert.equal(load('src/lib/auth-config.ts', env).isMockAuthEnabled(), expected);
});

test('空密钥、短密钥和示例密钥必须拒绝', () => {
  for (const value of [undefined, '', 'short', 'your-super-secret-jwt-key-change-this-in-production']) {
    assert.throws(() => load('src/lib/auth-config.ts', { JWT_SECRET: value }).requireAuthSecret());
  }
  assert.equal(load('src/lib/auth-config.ts', { JWT_SECRET: secret }).requireAuthSecret(), secret);
});

test('生产登录即使开启模拟开关也必须查询数据库', async () => {
  let queried = false;
  const route = load('src/app/api/auth/login/route.ts', { NODE_ENV: 'production', USE_MOCK_DB: 'true', JWT_SECRET: secret }, {
    bcryptjs: { compare: async () => false }, jsonwebtoken: { sign() { throw Error('禁止签发'); } },
    '@/lib/http': { rateLimit: () => null }, '@/lib/mongodb': async () => {},
    '@/models/User': { findOne: async () => { queried = true; return null; } }
  });
  const result = await route.POST(request({ email: 'admin@example.com', password: 'wrong' }));
  assert.equal(queried, true); assert.equal(result.status, 404); assert.equal(result.body.token, undefined);
});

test('缺少密钥时登录失败且不签发令牌', async () => {
  const route = load('src/app/api/auth/login/route.ts', { NODE_ENV: 'development', USE_MOCK_DB: 'true' }, {
    bcryptjs: {}, jsonwebtoken: { sign() { throw Error('禁止签发'); } }, '@/lib/http': { rateLimit: () => null }
  });
  const result = await route.POST(request({ email: 'admin@example.com', password: 'anything' }));
  assert.equal(result.status, 500); assert.equal(result.body.token, undefined);
});

test('数据库故障必须拒绝访问，不信任JWT中的管理员角色', async () => {
  const auth = load('src/lib/auth.ts', { NODE_ENV: 'production', JWT_SECRET: secret }, {
    jsonwebtoken: { verify: () => ({ userId: 'test-user', role: 'admin' }) },
    '@/models/User': {}, '@/lib/mongodb': async () => { throw Error('isolated failure'); }
  });
  const result = await auth.authMiddleware(request({}), ['admin']);
  assert.equal(result.status, 503);
});

test('管理员已被降权时拒绝旧令牌', async () => {
  const auth = load('src/lib/auth.ts', { NODE_ENV: 'production', JWT_SECRET: secret }, {
    jsonwebtoken: { verify: () => ({ userId: 'test-user', role: 'admin' }) },
    '@/models/User': { findById: async () => ({ _id: 'test-user', role: 'student' }) }, '@/lib/mongodb': async () => {}
  });
  assert.equal((await auth.authMiddleware(request({}), ['admin'])).status, 403);
});

test('有效签名与当前数据库角色允许正常访问', async () => {
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ userId: 'test-user', role: 'admin' }, secret, { expiresIn: '1m' });
  const auth = load('src/lib/auth.ts', { NODE_ENV: 'production', JWT_SECRET: secret }, {
    jsonwebtoken: jwt, '@/lib/mongodb': async () => {},
    '@/models/User': { findById: async () => ({ _id: 'test-user', role: 'admin' }) }
  });
  const req = { headers: new Headers({ authorization: 'Bearer ' + token }) };
  const result = await auth.authMiddleware(req, ['admin']);
  assert.equal(result.success, true); assert.equal(result.userId, 'test-user');
});

test('篡改或过期的签名拒绝访问', async () => {
  const jwt = require('jsonwebtoken');
  const auth = load('src/lib/auth.ts', { NODE_ENV: 'production', JWT_SECRET: secret }, {
    jsonwebtoken: jwt, '@/lib/mongodb': async () => { throw Error('不应查询数据库'); }, '@/models/User': {}
  });
  for (const token of [jwt.sign({ userId: 'test-user' }, 'incorrect-key'), jwt.sign({ userId: 'test-user' }, secret, { expiresIn: -1 })]) {
    const result = await auth.authMiddleware({ headers: new Headers({ authorization: 'Bearer ' + token }) });
    assert.equal(result.status, 401);
  }
});

test('真实密码验证通过后正常登录并签发令牌', async () => {
  const jwt = require('jsonwebtoken');
  const user = { _id: 'test-user', role: 'student', password: 'isolated-hash', toObject: () => ({ _id: 'test-user', role: 'student', password: 'isolated-hash' }) };
  const route = load('src/app/api/auth/login/route.ts', { NODE_ENV: 'production', JWT_SECRET: secret }, {
    bcryptjs: { compare: async () => true }, jsonwebtoken: jwt, '@/lib/http': { rateLimit: () => null },
    '@/lib/mongodb': async () => {}, '@/models/User': { findOne: async () => user }
  });
  const result = await route.POST(request({ email: 'student@example.com', password: 'test-password' }));
  assert.equal(result.status, 200); assert.equal(result.body.user.password, undefined);
  assert.equal(jwt.verify(result.body.token, secret).role, 'student');
});

for (const mode of ['missing', 'failure', 'success']) {
  test('重置邮件 ' + mode + ' 时响应均不泄露链接', async () => {
    let sent = false;
    const env = { NODE_ENV: 'production', USE_MOCK_DB: 'false', NEXT_PUBLIC_APP_URL: 'https://example.com' };
    if (mode !== 'missing') Object.assign(env, { SMTP_HOST: 'localhost', SMTP_USER: 'local', SMTP_PASS: 'test-only' });
    const route = load('src/app/api/auth/forgot-password/route.ts', env, {
      jsonwebtoken: {}, bcryptjs: { hash: async () => 'isolated-hash' }, crypto: require('node:crypto'),
      '@/lib/mongodb': async () => {}, '@/models/User': { findOne: async () => ({ save: async () => {} }) },
      nodemailer: { createTransport: () => ({ sendMail: async () => { if (mode === 'failure') throw Error('mail failure'); sent = true; } }) }
    });
    const result = await route.POST(request({ email: 'student@example.com' }));
    assert.equal(result.status, mode === 'success' ? 200 : 503);
    assert.equal(result.body.resetUrl, undefined); assert.equal(result.body.resetToken, undefined);
    assert.equal(sent, mode === 'success');
  });
}
