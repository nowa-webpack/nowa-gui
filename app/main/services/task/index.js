const ansiHTML = require('ansi-html');

let task = {};

const getCmd = (cmd) => {
  if (!task[cmd]) {
    task[cmd] = {};
  }
  return task[cmd];
};

const getTask = (cmd, name) => {
  const t = getCmd(cmd);
  if (!t[name]) {
    t[name] = {
      term: null,
      uid: '',
      log: ''
    };
    task[cmd] = t;
  }

  return t[name];
};

const setTask = (cmd, name, cnt) => {
  const t = getTask(cmd, name);
  task[cmd][name] = Object.assign(t, cnt);
};

// const setTask = ({ cmd, name, cnt }) => {
//   const t = Object.assign(getTask(cmd, name), cnt);
//   task[cmd][name] = t;
//   console.log(task)
// };

const writeLog = (cmd, name, str) => {
  const t = getTask(cmd, name);
  t.log += ansiHTML(str.replace(/\n/g, '<br>'));
  task[cmd][name] = t;
  return t.log;
};

const clearLog = (cmd, name) => {
  setTask(cmd, name, {
    log: ''
  });
};

const clearTerm = (cmd, name) => {
  setTask(cmd, name, {
    term: null,
    uid: ''
  });
};


// const writeLog = ({ cmd, name, str }) => {
//   const t = getTask(cmd, name);
//   t.log += ansiHTML(str.replace(/\n/g, '<br>'));
//   task[cmd][name] = t;
//   return t.log;
// };

// const clearLog = ({ cmd, name }) => {
//   setTask({
//     cmd, name, cnt: {
//       log: ''
//   }});
// }

// const clearTerm = ({ cmd, name }) => {
//   setTask({
//     cmd, name, cnt: {
//       term: null,
//       uid: ''
//   }});
// }


module.exports = {
  getCmd,
  getTask,
  setTask,
  writeLog,
  clearLog,
  clearTerm,
};
