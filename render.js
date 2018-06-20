module.exports = function render({ posts, time }) {
  const start = Date.now();
  while (Date.now() - start - 30) {}

  const postList = posts.map(post =>
    `<div><h2>${post.title}</h2><p>${post.body}</p></div>`
  ).join('');
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Hello</title>
    <style>
      body {
        font-family: sans-serif;
      }
    </style>
  </head>
  <body>
    <h1>Sample Page</h1>
    <p>${time}</p>
    ${postList}
  </body>
</html>`;
};
