# perf-playground

A playground for [perf(1)](http://man7.org/linux/man-pages/man1/perf.1.html) cand [FlameGraph](https://github.com/brendangregg/FlameGraph) with Node.js and Docker

```sh
# Build a Docker image and run it in the background
npm run build
npm start

# Generate a flame graph
./flame.sh

# In another terminal...
ab -c 3 -n 1000 http://localhost:8080/
```
