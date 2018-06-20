const express = require('express');
const getPosts = require('./api');
const render = require('./render');

const app = express();
app.get('/', (req, res) => {
  getPosts()
    .then(posts => render({
      posts,
      time: new Date().toISOString(),
    }))
    .then((html) => {
      res.send(html);
    });
});
app.listen(8080, () => {
  console.log('Listening on 8080');
});
