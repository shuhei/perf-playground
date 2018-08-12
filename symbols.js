const fs = require('fs');
const path = require('path');

const availableCommands = [
  'tidy',
  'find',
  'update',
];

const command = process.argv[2];
if (!availableCommands.includes(command)) {
  console.error(`Available commands: ${availableCommands.join(', ')}`);
  process.exit(1);
}
const filename = process.argv[3];
if (!filename) {
  console.error('Symbol file name should be given');
  process.exit(1);
}

// Get entries
const content = fs.readFileSync(filename, { encoding: 'utf8' });
const entries = content.split(/\r?\n/).filter(Boolean).map(line => {
  const components = line.split(' ');
  return {
    start: parseInt(components[0], 16),
    size: parseInt(components[1], 16),
    name: components.slice(2).join(' '),
  };
});
console.log(`Total: ${entries.length} entries`);

// Mark outdated: O(N^2)
// TODO: Use better algorithm if necessary
const outdated = new WeakSet();
entries.forEach((entry, i) => {
  for (let j = 0; j < i; j++) {
    const previousEntry = entries[j];
    if (intersect(entry, previousEntry)) {
      outdated.add(previousEntry);
    }
  }
});
const freshEntries = entries.filter(entry => !outdated.has(entry));
console.log(`Fresh: ${freshEntries.length} entries`);

switch (command) {
  case 'find': {
    const address = parseInt(process.argv[4], 16);
    if (Number.isNaN(address)) {
      console.error('Address should be a hex number');
      process.exit(1);
    }
    const matches = entries.filter(entry => inRange(address, entry));
    printEntries('All Matches', matches);

    const freshMatches = freshEntries.filter(entry => inRange(address, entry));
    printEntries('Fresh Matches', freshMatches);
  }
  case 'tidy': {
    const outFilename = process.argv[4];
    if (!outFilename) {
      console.error('Output filename should be given');
      process.exit(1);
    }
    const output = freshEntries.map(stringifyEntry).join('\n');
    fs.writeFileSync(path.resolve(outFilename), output);
  }
  case 'update': {
    const stackFilename = process.argv[4];
    const outFilename = process.argv[5];
    if (!stackFilename) {
      console.error('Stack trace filename should be given');
      process.exit(1);
    }
    if (!outFilename) {
      console.error('Output filename should be given');
      process.exit(1);
    }

    const stacks = fs.readFileSync(stackFilename, { encoding: 'utf8' });
    const output = stacks.split(/\r?\n/).map((line) => {
      const pattern = /^(\s+)([0-9a-f]+) (.+) (\(\/tmp\/perf-[0-9]+\.map\))$/;
      const match = pattern.exec(line);
      if (!match) {
        return line;
      }
      const [_, space, addressStr, symbol, filename] = match;
      const address = parseInt(addressStr, 16);
      const newSymbol = findSymbol(freshEntries, address) || symbol;
      return `${space}${addressStr} ${newSymbol} ${filename}`;
    }).join('\n');
    fs.writeFileSync(path.resolve(outFilename), output);
  }
}

function inRange(address, { start, size }) {
  return start <= address && address < start + size;
}

function intersect(a, b) {
  // Make sure that `a` is earlier than `b`.
  if (a.start > b.start) {
    return intersect(b, a);
  }
  return a.start + a.size > b.start;
}

function printEntries(label, entries) {
  console.log(`${label}: ${entries.length} entries`);
  entries.forEach(entry => {
    console.log(`    ${stringifyEntry(entry)}`);
  });
}

function stringifyEntry(entry) {
    return `${entry.start.toString(16)} ${entry.size.toString(16)} ${entry.name}`;
}

function findSymbol(entries, address) {
  const found = entries.find(entry => inRange(address, entry));
  return found && found.name;
}
