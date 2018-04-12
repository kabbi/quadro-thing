const fs = require('fs')
const { msleep } = require('sleep');

const send = cmd => {
  const fd = fs.openSync('/dev/servoblaster', 'w')
  fs.writeSync(fd, `${cmd}\n`)
  fs.closeSync(fd);
}

let current = 100
setInterval(() => {
  current = current === 100 ? 250 : 100
  send(`0=${current}`)
}, 2000);
