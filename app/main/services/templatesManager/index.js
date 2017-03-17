const official = require('./official');
const { getMainifest, setMainifest } = require('./manifest');
const custom = require('./custom');

module.exports = {
  getMainifest,
  setMainifest,
  official,
  custom,
};
