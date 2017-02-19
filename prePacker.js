const fs = require('fs-extra');
const { join } = require('path');
const target = join(__dirname, 'app', 'nodes', 'node');

if (process.platform === 'darwin') {
  if (!fs.existsSync(target)) {
    fs.copySync(join(__dirname, 'nodes', 'mac', 'node'), target);
  }
}

if (process.platform === 'linux') {
  if (!fs.existsSync(target)) {
    fs.copySync(join(__dirname, 'nodes', 'linux', 'node'), target);
  }
}