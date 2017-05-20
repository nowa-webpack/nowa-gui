import ansiHTML from 'ansi-html';
import iconv from 'iconv-lite';
// import userConfig from '../../userConfig';
import config from 'config-main-nowa';

class TaskLog {
  constructor() {
    this.log = {};
  }

  getCmd(cmd) {
    if (!this.log[cmd]) {
      this.log[cmd] = {};
    }
    return this.log[cmd];
  }

  getTask(cmd, name) {
    const task = this.getCmd(cmd);

    if (!task[name]) {
      task[name] = {
        term: null,
        uid: '',
        log: ''
      };
      this.log[cmd] = task;
    }

    return task[name];
  }

  setTask(cmd, name, content) {
    const task = this.getTask(cmd, name);
    this.log[cmd][name] = Object.assign(task, content);
  }

  writeLog(cmd, name, buf) {
    const str = iconv.decode(buf, config.getItem('ENCODE'));
    const task = this.getTask(cmd, name);

    task.log += ansiHTML(str.replace(/\n/g, '<br>'));
    this.log[cmd][name] = task;
    return task.log;
  }

  clearLog(cmd, name) {
    this.setTask(cmd, name, {
      term: null,
      uid: ''
    });
  }
}

export default new TaskLog();
