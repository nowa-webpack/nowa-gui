const { join } = require('path');
const { constants } = require('../is');
module.exports = {
  browser: {
    width: 900,
    height: 552,
    frame: false,
    show: false,
    resizable: false,
    fullscreenable: false,
    maximizable: false,
    backgroundColor: '#aaa',
  },

  devWebUrl: 'http://localhost:8080/index.html',
  // prodStaticUrl: join(__dirname, '..', '..', '..', 'dist', 'index.html'),
  prodStaticUrl: join(constants.APP_PATH, 'dist', 'index.html'),

};
