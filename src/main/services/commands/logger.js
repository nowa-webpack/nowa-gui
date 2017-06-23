import mainWin from '../windowManager';

// class Logger extends console.Console {
class Logger {
  constructor(sender) {
    // super(process.stdout, process.stderr);
    this.buffer = [];
    this.sender = sender;

    ['error', 'log', 'info', 'debug', 'warn'].forEach((key) => {
      this[key] = this.capture.bind(this);
    });
  }

  capture() {
    const args = [...arguments];
    const res = args.shift().replace(/(%s)/g, () => args.shift());
    this.buffer.push(res);
    mainWin.send(`${this.sender}-logging`, this.buffer);
  }


  clear() {
    this.buffer = [];
    console.clear();
  }
}

export default Logger;
