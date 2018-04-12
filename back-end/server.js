const ip = require('ip');
const { Gpio } = require('pigpio');
const express = require('express');
const InputEvent = require('input-event');
const { spawn } = require('child_process');
const debug = require('debug')('app:server');

const app = express();

const LegPins = [4, 17, 27, 18];
const KneePins = [22, 23, 24, 25];
const LegOffsets = [-10, 10, 0, 0];
const KneeOffsets = [0, 15, 5, 10];
const Indices = [0, 1, 2, 3];

const InitialLeg = 160;
const InitialKnee = 90;

const { KEY_CODES } = InputEvent.Keyboard;
const ServoByKey = {
  [KEY_CODES.BTN_SOUTH]: 0,
  [KEY_CODES.BTN_EAST]: 1,
  [KEY_CODES.BTN_WEST]: 2,
  [KEY_CODES.BTN_NORTH]: 3,
}

const legs = LegPins.map(pin => new Gpio(pin, { mode: Gpio.OUTPUT }));
const knees = KneePins.map(pin => new Gpio(pin, { mode: Gpio.OUTPUT }));

const max = 2500;
const min = 500;

const clamp = (v, min, max) => Math.max(Math.min(v, max), min);
const v = deg => clamp(Math.floor((max - min) * (deg / 180) + min), min, max);

const setLeg = (index, d) => {
  legs[index].servoWrite(v(d + LegOffsets[index]));
};

const setKnee = (index, d) => {
  knees[index].servoWrite(v(d + KneeOffsets[index]));
};

const eachLeg = d => Indices.forEach(i => setLeg(i, d));
const eachKnee = d => Indices.forEach(i => setKnee(i, d));
const legDelta = (index, d) => setLeg(index, InitialLeg + d);
const kneeDelta = (index, d) => setKnee(index, InitialKnee + d);

const delay = time => new Promise(resolve => setTimeout(resolve, time));

const moves = {
  async horse() {
    kneeDelta(0, -40);
    kneeDelta(1, +40);
    await delay(500);

    kneeDelta(2, -40);
    kneeDelta(3, +40);
    await delay(500);
  },
  async reverseHorse() {
    kneeDelta(0, +50);
    kneeDelta(3, -50);
    await delay(500);

    kneeDelta(1, -40);
    kneeDelta(2, +40);
    await delay(500);
  },
  async forward1({ count = 30 }) {
    legDelta(0, -30);
    await delay(100);

    for (let i = 0; i < count; i++) {
      legDelta(0, 0);
      legDelta(3, -30);
      legDelta(1, -40);
      legDelta(2, -40);
      await delay(100);
      legDelta(0, -30);
      legDelta(3, 0);
      legDelta(1, 0);
      legDelta(2, 0);
      await delay(100);
    }
  },
  async reset() {
    eachLeg(InitialLeg);
    eachKnee(InitialKnee);
  },
  async wiggle({ count = 50 }) {
    const r = () => Math.floor(Math.random() * Indices.length);
    for (let i = 0; i < count; i++) {
      legDelta(r(), -Math.random() * 30);
      legDelta(r(), -Math.random() * 30);
      await delay(50);
      kneeDelta(r(), Math.random() * 50 - 25);
      kneeDelta(r(), Math.random() * 50 - 25);
      await delay(50);
    }
  },
  async handleKeyDown({ key }) {
    legDelta(ServoByKey[key], -90);
  },
  async handleKeyUp({ key }) {
    legDelta(ServoByKey[key], 0);
  },
  async execute({ program = '' }) {
    const lines = program.split('\n').map(s => s.trim()).filter(l => !!l)
    console.log('xec', lines)
    for (const line of lines) {
      const [cmd, ...args] = line.split(' ');
      switch (cmd) {
        case 'delay':
        case 'd': {
          await delay(+args[0] || 100);
          break;
        }
        case 'l1':
        case 'l2':
        case 'l3':
        case 'l4': {
          const index = +cmd[1] - 1;
          legDelta(index, +args[0] || 0)
          break;
        }
        case 'k1':
        case 'k2':
        case 'k3':
        case 'k4': {
          const index = +cmd[1] - 1;
          kneeDelta(index, +args[0] || 0)
          break;
        }
        case 'reset': {
          await moves.reset();
          break;
        }
      }
    }
  },
  shutdown() {
    for (const leg of legs) {
      leg.servoWrite(0);
    }
    for (const knee of knees) {
      knee.servoWrite(0);
    }
  },
  poweroff() {
    spawn('shutdown', ['-h', 'now']);
  }
};

app.get('/api/:method', async (req, res) => {
  const handler = moves[req.params.method];
  if (!handler) {
    res.status(400).send({
      what: `No such method: ${req.params.method}`,
      ok: false,
    });
    return;
  }
  await handler(req.query);
  setTimeout(moves.shutdown, 1000);
  res.send({ ok: true });
});

app.use(express.static('public'));

try {

  const input = new InputEvent('/dev/input/event0');
  const keyboard = new InputEvent.Keyboard(input);
  const mouse = new InputEvent.Mouse(input);
  keyboard.on('keydown', async (event) => {
    await moves.handleKeyDown({ key: event.code });
  });
  keyboard.on('keyup', async (event) => {
    await moves.handleKeyUp({ key: event.code });
    await moves.reset();
    setTimeout(moves.shutdown, 1000);
  });
} catch (error) {
  debug('Failed to listen for events');
}

debug('listening at http://%s:3000', ip.address());
app.listen(3000);
