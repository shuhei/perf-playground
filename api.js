const url = require('url');
const https = require('https');

const agent = new https.Agent({
  keepAlive: true,
});

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
    };
    const req = https.get(options, (res) => {
      console.timeEnd(name);
      console.time(nameDone);
      if (res.statusCode !== 200) {
        reject(new Error(`Non-200 status code ${res.statusCode}`));
        return;
      }
      res.setEncoding('utf8');
      let buffer = '';
      res.on('data', (chunk) => {
        buffer += chunk;
      });
      res.on('end', () => {
        console.timeEnd(nameDone);
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
    .then(([posts]) => {
      // Use only /posts and ignore the other responses.
      return posts;
    });
};
