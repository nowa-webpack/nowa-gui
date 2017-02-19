const npminstall = require('npminstall');
const co = require('co');

const msg = JSON.parse(process.env.params);


const options = Object.assign(msg, { console });

// console.log(options)

co(function* () {

  yield npminstall(options);
}).catch((err) => {
  console.error(err.stack);
});

