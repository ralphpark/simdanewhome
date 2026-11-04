// Offline contract checks: no DB connection, credentials, ports, or Blob upload.
// Run: node script/test-site-images.mjs
import assert from 'node:assert/strict';
import { build } from 'esbuild';

async function moduleFrom(entry, plugins) {
  const result = await build({ entryPoints: [entry], bundle: true, write: false, platform: 'node', format: 'esm', plugins });
  return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
}
const { MemStorage } = await moduleFrom('server/storage.ts', [{
  name: 'no-database', setup(build) {
    build.onResolve({ filter: /^\.\/db$/ }, () => ({ path: 'db', namespace: 'offline' }));
    build.onLoad({ filter: /.*/, namespace: 'offline' }, () => ({ contents: 'export const db = new Proxy({}, {get(){throw new Error("Unexpected database access")}})' }));
  },
}]);
const { registerSiteImageRoutes } = await moduleFrom('server/site-image-routes.ts', [{
  name: 'no-blob-network', setup(build) {
    build.onResolve({ filter: /^@vercel\/blob\/client$/ }, () => ({ path: 'blob', namespace: 'offline' }));
    build.onLoad({ filter: /.*/, namespace: 'offline' }, () => ({ contents: 'export async function handleUpload(options) { if (options.onUploadCompleted) throw new Error("Unexpected webhook"); return { permissions: await options.onBeforeGenerateToken(), type: options.body.type }; }' }));
  },
}]);
const storage = new MemStorage();
const routes = new Map();
const app = Object.fromEntries(['get', 'put', 'delete', 'post'].map(method => [method, (path, ...handlers) => routes.set(`${method} ${path}`, handlers)]));
const auth = (req, res, next) => req.authorized ? next() : res.status(401).json({ error: 'Unauthorized' });
registerSiteImageRoutes(app, storage, auth);
async function request(method, path, { key = 'home.hero', body, authorized = false } = {}) {
  const result = { status: 200, body: undefined };
  const res = { status(code) { result.status = code; return this; }, json(value) { result.body = value; return this; }, end() { return this; } };
  const handlers = routes.get(`${method} ${path}`);
  assert.ok(handlers);
  let index = 0;
  async function next() { const handler = handlers[index++]; if (handler) return handler({ params: { key }, body, authorized }, res, next); }
  await next();
  return result;
}
const endpoint = '/api/site-images/:key';
assert.deepEqual((await request('get', '/api/site-images')).body, []);
for (const [method, path] of [['put', endpoint], ['delete', endpoint], ['post', '/api/blob-upload']]) {
  assert.equal(routes.get(`${method} ${path}`)[0], auth);
  assert.equal((await request(method, path)).status, 401);
}
for (const url of ['http://example.com/a.png', 'javascript:alert(1)', '/a.png', 'https://user:password@example.com/a.png', 'invalid']) {
  assert.equal((await request('put', endpoint, { authorized: true, body: { url } })).status, 400);
}
assert.equal((await request('put', endpoint, { authorized: true, key: 'unknown', body: { url: 'https://example.com/a.png' } })).status, 400);
assert.equal((await request('delete', endpoint, { authorized: true, key: 'unknown' })).status, 400);
assert.equal((await request('put', endpoint, { authorized: true, body: { url: 'https://example.com/a.png', alt: '초록 식물' } })).status, 200);
assert.equal((await request('get', '/api/site-images')).body[0].alt, '초록 식물');
await request('put', endpoint, { authorized: true, body: { key: 'story.opening', url: 'https://example.com/b.png', alt: '' } });
const updated = (await request('get', '/api/site-images')).body;
assert.equal(updated.length, 1);
assert.equal(updated[0].key, 'home.hero');
assert.equal(updated[0].alt, '');
assert.ok(updated[0].updatedAt instanceof Date);
assert.equal((await request('delete', endpoint, { authorized: true })).status, 204);
assert.deepEqual((await request('get', '/api/site-images')).body, []);
const token = { type: 'blob.generate-client-token', payload: { pathname: 'site-images/home.hero/image.webp', multipart: false, clientPayload: 'home.hero' } };
const issued = await request('post', '/api/blob-upload', { authorized: true, body: token });
assert.equal(issued.status, 200);
assert.equal(issued.body.permissions.maximumSizeInBytes, 20 * 1024 * 1024);
assert.equal(issued.body.permissions.addRandomSuffix, true);
assert.deepEqual(issued.body.permissions.allowedContentTypes, ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);
for (const pathname of ['other/image.png', 'site-images/story.opening/image.png', 'site-images/home.hero/../image.png', 'site-images/home.hero/image.svg', 'site-images/home.hero/file.html']) {
  assert.equal((await request('post', '/api/blob-upload', { authorized: true, body: { ...token, payload: { ...token.payload, pathname } } })).status, 400);
}
assert.equal((await request('post', '/api/blob-upload', { authorized: true, body: { type: 'blob.upload-completed', payload: {} } })).status, 400);
assert.equal((await request('post', '/api/blob-upload', { authorized: true, body: null })).status, 400);
const broken = { getSiteImages: async () => { throw new Error('db unavailable'); }, upsertSiteImage: async () => { throw new Error('db unavailable'); }, deleteSiteImage: async () => { throw new Error('db unavailable'); } };
registerSiteImageRoutes(app, broken, auth);
assert.equal((await request('get', '/api/site-images')).status, 500);
assert.equal((await request('put', endpoint, { authorized: true, body: { url: 'https://example.com/a.png' } })).status, 500);
assert.equal((await request('delete', endpoint, { authorized: true })).status, 500);
console.log('PASS: image CRUD, authentication gates, key/HTTPS validation, upload permissions/path validation, DB failure handling');
