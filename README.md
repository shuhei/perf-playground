# perf-playground

A playground for [perf(1)](http://man7.org/linux/man-pages/man1/perf.1.html) and [FlameGraph](https://github.com/brendangregg/FlameGraph) with Node.js and Docker

The way to make FlameGraph for a process in Docker container is based on [Making FlameGraphs with Containerized Java](http://blog.alicegoldfuss.com/making-flamegraphs-with-containerized-java/).

## Prepare

```sh
sudo apt-get install linux-tools-common linux-tools-$(uname -r)
```

## Try

```sh
npm install

# Build a Docker image and run it in the background
npm run build-node8
npm run start-node8
# or
npm run build-node10
npm run start-node10
# or
npm run build-alpine
npm run start-alpine

# Generate a flame graph
./flame.sh
```
