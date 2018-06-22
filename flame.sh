#!/usr/bin/env bash

# Get the actual Node.js process. The top one is `bash -c` process to execute Node.js.
host_node_pid=$(pgrep node -f | tail -n 1)
# Get a container ID made from `perf-test` image.
container_id=$(sudo docker ps --format '{{.ID}}' --filter 'ancestor=perf-test')
# Get the actual Node.js process from the Docker container.
container_node_pid=$(sudo docker exec ${container_id} pgrep node -f | tail -n 1)

echo container id ${container_id}
echo host node pid ${host_node_pid}
echo container node pid ${container_node_pid}

echo "Recording CPU usage"
sudo perf record -F 99 -p ${host_node_pid} -g -- sleep 30s

echo "Copy symbol data"
sudo docker cp ${container_id}:/tmp/perf-${container_node_pid}.map /tmp/perf-${host_node_pid}.map

echo "Generate flame graph"
sudo perf script | ./FlameGraph/stackcollapse-perf.pl | ./FlameGraph/flamegraph.pl --colors js > out.svg
