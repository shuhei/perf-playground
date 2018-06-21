# perf-playground

A playground for perf command and flamegraph with Node.js and Docker

```sh
# Build a Docker image and run it in the background
npm run build
npm start

# Generate a flame graph
./flame.sh

# In another terminal...
ab -c 3 -n 1000 http://localhost:8080/
```
