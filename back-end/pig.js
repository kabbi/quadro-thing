#!/usr/bin/env node
// @flow

const { Gpio } = require('pigpio');
const debug = require('debug')('app');

const LegPins = [4, 17, 27, 18];
const KneePins = [22, 23, 24, 25];
const LegOffsets = [-10, 10, 0, 0];
const KneeOffsets = [0, 15, 5, 5];
const Indices = [0, 1, 2, 3];

const InitialLeg = 160;
const InitialKnee = 90;

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

const moves = {
  *horse() {
    kneeDelta(0, -40);
    kneeDelta(1, +40);
    yield 500;

    kneeDelta(2, -40);
    kneeDelta(3, +40);
    yield 500;
  },
  *reverseHorse() {
    kneeDelta(0, +50);
    kneeDelta(3, -50);
    yield 500;

    kneeDelta(1, -40);
    kneeDelta(2, +40);
    yield 500;
  },
  *forward1() {
    legDelta(0, -30);
    yield 100;

    for (let i = 0; i < 30; i++) {
      legDelta(0, 0);
      legDelta(3, -30);
      legDelta(1, -40);
      legDelta(2, -40);
      yield 100;
      legDelta(0, -30);
      legDelta(3, 0);
      legDelta(1, 0);
      legDelta(2, 0);
      yield 100;
    }
  },
  *reset() {
    eachLeg(InitialLeg);
    eachKnee(InitialKnee);
  },
  *wiggle() {
    const r = () => Math.floor(Math.random() * Indices.length);
    while (true) {
      legDelta(r(), -Math.random() * 30);
      legDelta(r(), -Math.random() * 30);
      yield 50;
      kneeDelta(r(), Math.random() * 50 - 25);
      kneeDelta(r(), Math.random() * 50 - 25);
      yield 50;
    }
  },
};

function* run() {
  debug('starting up');
  let Delta = 70;
  let angle = 150;
  let increment = 5;
  let index = 2;

  yield 1000;
  yield* moves.wiggle();

  legDelta(0, -30);
  yield 100;

  for (let i = 0; i < 30; i++) {
    legDelta(0, 10);
    legDelta(3, -50);
    kneeDelta(0, 0);
    kneeDelta(3, 0);
    yield 500;
    legDelta(0, -30);
    legDelta(3, 0);
    kneeDelta(0, +50);
    kneeDelta(3, -50);
    yield 500;
  }
  yield* moves.reset();
  while (true);
}

const exec = task =>
  new Promise(resolve => {
    const gen = task();
    const step = () => {
      const { value, done } = gen.next();
      if (done) {
        resolve();
        return;
      }
      setTimeout(step, value);
    };
    step();
  });

const main = async () => {
  await exec(moves.reset);
  await exec(run);
};

main();
