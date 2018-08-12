#!/usr/bin/env bash

# Get the actual Node.js process. The top one is `bash -c` process to execute Node.js.
user=$(whoami)
host_node_pid=$(pgrep node -f | tail -n 1)
# Get a container ID made from `perf-test` image.
container_id=$(sudo docker ps --format '{{.ID}}')
# Get the actual Node.js process from the Docker container.
container_node_pid=$(sudo docker exec ${container_id} pgrep node -f | tail -n 1)
zerox_dir=prof/0x-${host_node_pid}
perf_data=${zerox_dir}/perf.data
mkdir -p ${zerox_dir}

echo container id ${container_id}
echo host node pid ${host_node_pid}
echo container node pid ${container_node_pid}

echo "Start making requests to the server"
autocannon -c 3 -d 35 -n http://localhost:8080 &
echo "Waiting for warming up..."
sleep 5s
echo "Recording CPU usage"
sudo perf record -F 99 -p ${host_node_pid} -o ${perf_data} -g -- sleep 30s

# TODO: Who reads this file? And when? Probably `perf script`?
echo "Copy symbol data"
sudo docker cp ${container_id}:/tmp/perf-${container_node_pid}.map /tmp/perf-${host_node_pid}.map

echo "Generate flame graph"
sudo perf script -i ${perf_data} | ./FlameGraph/stackcollapse-perf.pl | ./FlameGraph/flamegraph.pl --colors js > out.svg

# Make a dedidated directory because 0x reads all the files in a given directory.
sudo perf script -i ${perf_data} > ${zerox_dir}/stacks.${host_node_pid}.out
0x --visualize-only ${zerox_dir}
echo "Generated flame graph at ${zerox_dir}"

sudo chown ${user}:${user} ${perf_data}
cp /tmp/perf-${host_node_pid}.map ${zerox_dir}/
