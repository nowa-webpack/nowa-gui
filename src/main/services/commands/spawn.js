/**
 * Created by nuintun on 2016/1/14.
 */


// const spawn = require('child_process').spawn;
import { spawn } from 'child_process';

/**
 * normalize exec args
 * @param command
 * @param options
 * @returns {{cmd: *, shell: *, args: *, options: *}}
 */
function normalizeExecArgs(command, options) {
  let shell;
  let args;

  // Make a shallow copy before patching so we don't clobber the user's
  // options object.
  options = options || {};

  if (process.platform === 'win32') {
    shell = process.env.comspec || 'cmd.exe';
    // args = ['/s', '/c', '"' + command + '"'];
    args = ['/s', '/c', `"${command}"`];
    options.windowsVerbatimArguments = true;
  } else {
    shell = '/bin/sh';
    args = ['-c', command];
  }

  if (options.shell) {
    shell = options.shell;
  }

  return {
    shell,
    args,
    options,
  };
}

/**
 * exec thread
 */

export default function () {
  const parsed = normalizeExecArgs.apply(null, arguments);
  return spawn(parsed.shell, parsed.args, parsed.options);
};
/*module.exports = function() {
  const parsed = normalizeExecArgs.apply(null, arguments);

  return spawn(parsed.shell, parsed.args, parsed.options);
};*/
