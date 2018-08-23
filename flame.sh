#!/usr/bin/env bash

# Get the actual Node.js process. The top one is `bash -c` process to execute Node.js.
readonly user=$(whoami)
readonly host_node_pid=$(pgrep node -f | tail -n 1)
# Get a container ID made from `perf-test` image.
readonly container_id=$(sudo docker ps --format '{{.ID}}')
# Get the actual Node.js process from the Docker container.
readonly container_node_pid=$(sudo docker exec ${container_id} pgrep node -f | tail -n 1)
readonly zerox_dir=prof/0x-${host_node_pid}
readonly perf_data=${zerox_dir}/perf.data
readonly symbol_file=${zerox_dir}/perf-${host_node_pid}.map
readonly stack_file=${zerox_dir}/stacks.${host_node_pid}.out

echo container id ${container_id}
echo host node pid ${host_node_pid}
echo container node pid ${container_node_pid}

# Make a dedidated directory because 0x reads all the files in a given directory.
mkdir -p ${zerox_dir}

echo "Start making requests to the server"
autocannon -c 3 -d 35 -n http://localhost:8080 &
echo "Waiting for warming up..."
sleep 5s
echo "Recording CPU usage"
sudo perf record -F 99 -p ${host_node_pid} -o ${perf_data} -g -- sleep 30s
# sudo perf record -F 99 -a -o ${perf_data} -g -- sleep 30s

echo "Copy symbol map"
sudo docker cp ${container_id}:/tmp/perf-${container_node_pid}.map ${symbol_file}
sudo chown ${user}:${user} ${symbol_file}

echo "Generate stack trace"
sudo perf script -i ${perf_data} > ${stack_file}.original
sudo chown ${user}:${user} ${perf_data}

# Fix stack traces by picking latest symbols
node symbols.js update ${symbol_file} ${stack_file}.original ${stack_file}

echo "Generate flame graph"
0x --visualize-only ${zerox_dir}
echo "Generated flame graph at ${zerox_dir}"
