const fs = require('fs-extra');
const { join } = require('path');
const target = join(__dirname, 'app', 'nodes');

if (process.platform === 'darwin') {
  if (!fs.existsSync(target)) {
    fs.copySync(join(__dirname, 'nodes', 'mac', 'node'), join(target, 'node'));
  }
}

if (process.platform === 'linux') {
  if (!fs.existsSync(target)) {
    fs.copySync(
      join(__dirname, 'nodes', 'linux', 'node'),
      join(target, 'node')
    );
  }
}

if (process.platform === 'win32') {
  if (!fs.existsSync(target)) {
    fs.copySync(
      join(__dirname, 'nodes', 'win', 'node.exe'),
      join(target, 'node.exe')
    );
  }
}
