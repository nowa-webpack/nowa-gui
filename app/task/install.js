const npminstall = require('npminstall');
const co = require('co');

const msg = JSON.parse(process.env.params);


const options = Object.assign(msg, { console } );

// console.log(options)

co(function* () {
  const term = setInterval(() => {
    console.log(options.progresses)
  }, 400)

  setTimeout(()=> {
    clearInterval(term)
  }, 2000)
    yield npminstall(options);
}).catch((err) => {
  console.error(err.stack);
});

