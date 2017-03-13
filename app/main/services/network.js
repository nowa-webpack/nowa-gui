const { ipcMain } = require('electron');


let online = false;


module.exports = {
  init() {
    ipcMain.on('network-change-status', (event, status) => {
      console.log(status);
      online = status;
    });
  },

  getOnlineStatus() {
    return online;
  },

}