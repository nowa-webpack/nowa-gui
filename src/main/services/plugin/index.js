import portscanner from 'portscanner';
import uuidV4 from 'uuid/v4';
import WebSocket from 'ws';

import mainWin from '../windowManager';

class Plugin {
  constuctor() {
      this.port = '3000';
      this.pool = {};
  }

  async findFreePort() {
    const port = await portscanner.findAPortNotInUse(50000, 55000);
    this.port = port;
    return this;
  }

  sendPromtsAnswer({ uuid, answers }) {
    console.log(uuid, answers);
    this.pool[uuid].send(JSON.stringify(answers));
  }

  async start() {
    const that = this;
    await that.findFreePort();
    const wss = new WebSocket.Server({ port: that.port });

    wss.on('connection', (ws) => {
      const uuid = uuidV4();
      if (!that.pool) {
        that.pool = {};
      }
      that.pool[uuid] = ws;
      ws.on('message', (promts) => {
        console.log('received: %s', JSON.parse(promts));
        mainWin.send('plugin-render-promts', { promts: JSON.parse(promts), uuid });
      });
      ws.on('close', () => {
        delete that.pool[uuid];
      });
    });
  }
}

const plugin = new Plugin();

plugin.start();

export default plugin;
