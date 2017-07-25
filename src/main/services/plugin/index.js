import portscanner from 'portscanner';
import uuidV4 from 'uuid/v4';
import WebSocket from 'ws';

import mainWin from '../windowManager';
import log from '../applog';

class Plugin {
  constuctor() {
    this.port = '3000';
    this.pool = {};
    this.wss;
  }

  async findFreePort() {
    const port = await portscanner.findAPortNotInUse(30000, 35000);
    log.error('port:' + port);
    this.port = port;
    return this;
  }

  sendPromtsAnswer({ uuid, answers }) {
    console.log(uuid, answers);
    this.pool[uuid].send(JSON.stringify(answers));
    // this.pool[uuid].send(answers, { compress: false });
  }

  stop(){
    console.log('closing websocket');
    this.wss.close();
  }

  async start() {
    const that = this;
    await that.findFreePort();
    // log.error(that.port);
    this.wss = new WebSocket.Server({ port: that.port });

    this.wss.on('connection', (ws) => {
      const uuid = uuidV4();
      if (!that.pool) {
        that.pool = {};
      }
      that.pool[uuid] = ws;
      ws.on('message', (promts) => {
        console.log('received: %s', JSON.parse(promts));
        // console.log('received: %s', promts);
        mainWin.send('plugin-render-promts', { promts: JSON.parse(promts), uuid });
        // mainWin.send('plugin-render-promts', { promts, uuid });
      });
      ws.on('close', () => {
        delete that.pool[uuid];
      });
    });
  }

  getPort() {
    return this.port;
  }

}

const plugin = new Plugin();

// plugin.start();

export default plugin;
