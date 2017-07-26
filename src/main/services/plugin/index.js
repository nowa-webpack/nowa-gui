/*
  nowa-gui插件服务
*/
import portscanner from 'portscanner';
import uuidV4 from 'uuid/v4';
import WebSocket from 'ws';

import mainWin from '../windowManager';
import log from '../applog';

class Plugin {
  constuctor() {
    this.port = '30000';
    this.pool = {};
    this.wss;
  }

  // 寻找空闲端口号用于插件的websocket
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
    this.wss = new WebSocket.Server({ port: that.port });

    // 监听来自插件的调用提问模板的请求
    this.wss.on('connection', (ws) => {
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

  getPort() {
    return this.port;
  }
}

const plugin = new Plugin();

export default plugin;
