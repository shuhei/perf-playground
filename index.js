const express = require('express');
const getPosts = require('./api');
const render = require('./render');

const {
  PerformanceObserver,
  constants,
} = require('perf_hooks');
const kindMap = {
  [constants.NODE_PERFORMANCE_GC_MAJOR]: 'major',
  [constants.NODE_PERFORMANCE_GC_MINOR]: 'minor',
  [constants.NODE_PERFORMANCE_GC_INCREMENTAL]: 'incremental',
  [constants.NODE_PERFORMANCE_GC_WEAKCB]: 'weakcb',
};
const observer = new PerformanceObserver((list, observer) => {
  list.getEntries().forEach((e) => {
    console.log(`gc ${kindMap[e.kind]} ${e.startTime} ${e.duration} ms`);
  });
});
observer.observe({
  entryTypes: ['gc'],
  buffered: true,
});

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
