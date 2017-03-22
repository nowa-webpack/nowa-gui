const npminstall = require('npminstall');
const co = require('co');

const msg = JSON.parse(process.env.params);

const options = Object.assign(msg, { console });

co(function* () {
  
  const timer = setInterval(() => {
    console.log('INSTALL_PROGRESS', options.progresses);
  }, 1000);
  yield npminstall(options);
  clearInterval(timer);
  console.log('INSTALL_PROGRESS', options.progresses);
  process.exit(0);
})
.catch((err) => {
  process.exit(1);
});

