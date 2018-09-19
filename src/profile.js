const fs = require('fs');
const v8ProfilerNext = require('v8-profiler-next');
const v8ProfilerNode8 = require('v8-profiler-node8');

function setUpProfiling() {
  process.on('SIGUSR1', () => {
    console.log('Received SIGUSR1. Starting profiling');
    const title = 'test';
    v8ProfilerNext.startProfiling(title, true);
    setTimeout(() => {
      const profiler = v8ProfilerNext.stopProfiling(title);
      profiler.delete();
      console.log('Profiling done.');
      profiler.export((err, result) => {
        if (err) {
          console.error('Failed to export CPU profile', err);
          return;
        }
        fs.writeFile(`profile-next-${Date.now()}.cpuprofile`, result);
      });
    }, 30 * 1000);
  });

  process.on('SIGUSR2', () => {
    console.log('Received SIGUSR2. Starting profiling');
    const title = 'test';
    v8ProfilerNode8.startProfiling(title, true);
    setTimeout(() => {
      const profiler = v8ProfilerNode8.stopProfiling(title);
      profiler.delete();
      console.log('Profiling done.');
      profiler.export((err, result) => {
        if (err) {
          console.error('Failed to export CPU profile', err);
          return;
        }
        fs.writeFile(`profile-node8-${Date.now()}.cpuprofile`, result);
      });
    }, 30 * 1000);
  });
}

module.exports = setUpProfiling;
