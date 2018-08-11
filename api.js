const url = require('url');
const https = require('https');
const zlib = require('zlib');
const LRU = require('lru-cache');

const agent = new https.Agent({
  keepAlive: true,
});

const cache = LRU(500);

function getAPI(uri) {
  const n = Math.random();
  const name = `${n} ${uri} res`;
  const nameDone = `${n} ${uri} done`;
  console.time(name);
  return new Promise((resolve, reject) => {
    const { protocol, hostname, path } = url.parse(uri);
    const options = {
      protocol,
      hostname,
      path,
      agent,
      headers: {
        'accept-encoding': 'gzip',
      },
    };
    const req = https.get(options, (res) => {
      console.timeEnd(name);
      console.time(nameDone);
      if (res.statusCode !== 200) {
        reject(new Error(`Non-200 status code ${res.statusCode}`));
        res.resume();
        return;
      }
      const stream = (res.headers['content-encoding'] || '').includes('gzip')
        ? res.pipe(zlib.createGunzip())
        : res;
      stream.setEncoding('utf8');
      let buffer = '';
      stream.on('data', (chunk) => {
        buffer += chunk;
      });
      stream.on('end', () => {
        console.timeEnd(nameDone);
        // try/catch is not deoptimized anymore in Node.js 8.
        try {
          resolve(JSON.parse(buffer));
        } catch (e) {
          reject(e);
        }
      });
      res.on('error', (err) => {
        reject(err);
      });
    });
  });
}

module.exports = function getAPIs() {
  const promises = [
    'posts',
    'comments',
    'albums',
    'photos',
    'todos',
    'users',
  ].map(path => getAPI(`https://jsonplaceholder.typicode.com/${path}`));
  return Promise.all(promises)
    .then(([posts, comments, albums, photos, todos, users]) => {
      cache.set(Math.random().toString(), posts);
      cache.set(Math.random().toString(), comments);
      cache.set(Math.random().toString(), albums);
      cache.set(Math.random().toString(), todos);
      cache.set(Math.random().toString(), users);
      // Use only /posts and ignore the other responses.
      return posts;
    });
};
