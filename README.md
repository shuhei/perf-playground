# perf-playground

A playground for [perf(1)](http://man7.org/linux/man-pages/man1/perf.1.html) and [FlameGraph](https://github.com/brendangregg/FlameGraph) with Node.js and Docker

The way to make FlameGraph is based on [Making FlameGraphs with Containerized Java](http://blog.alicegoldfuss.com/making-flamegraphs-with-containerized-java/).

## Try

```sh
# Build a Docker image and run it in the background
npm run build
npm start

# Generate a flame graph
./flame.sh

# In another terminal...
ab -c 3 -n 1000 http://localhost:8080/
```
