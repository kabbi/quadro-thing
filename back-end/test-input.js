var InputEvent = require('input-event');

var input = new InputEvent('/dev/input/event0');

var keyboard = new InputEvent.Keyboard(input);
var mouse = new InputEvent.Mouse(input);

const CODES = {
  [InputEvent.Keyboard.KEY_CODES.BTN_WEST]: 'W',
  [InputEvent.Keyboard.KEY_CODES.BTN_EAST]: 'E',
  [InputEvent.Keyboard.KEY_CODES.BTN_SOUTH]: 'S',
  [InputEvent.Keyboard.KEY_CODES.BTN_NORTH]: 'N',
};
keyboard.on('keyup', e => console.log('up', CODES[e.code]));
keyboard.on('keydown', e => console.log('down', CODES[e.code]));
keyboard.on('keypress', e => console.log('press', CODES[e.code]));
// mouse.on('data', console.log);

