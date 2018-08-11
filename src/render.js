const React = require('react');
const ReactDOMServer = require('react-dom/server');

class Post extends React.Component {
  render() {
    const post = this.props.post;
    return React.createElement('div', {}, [
      React.createElement('h2', { key: 'heading' }, post.title),
      React.createElement('p', { key: 'body', }, post.body)
    ]);
  }
}

class PostList extends React.Component {
  render() {
    const children = this.props.posts
      .map(post => React.createElement(Post, { post, key: post.id }));
    return React.createElement('div', {}, children);
  }
}

module.exports = function render({ posts, time }) {
  const postList = React.createElement(PostList, { posts });
  const html = ReactDOMServer.renderToString(postList);

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
    ${html}
  </body>
</html>`;
};
