/* global Blockly */

Blockly.Blocks['robot_move_leg'] = {
  init() {
    this.jsonInit({
      message0: 'rotate %1 ⤾ %2',
      args0: [
        {
          type: 'input_value',
          name: 'LEG',
          check: 'Leg',
        },
        {
          type: 'input_value',
          name: 'ANGLE',
          check: 'Number',
        },
      ],
      previousStatement: null,
      nextStatement: null,
      inputsInline: true,
      tooltip: 'Move one leg',
      colour: 210,
    });
  },
};
Blockly.JavaScript['robot_move_leg'] = function(block) {
  var leg = Blockly.JavaScript.valueToCode(
    block,
    'LEG',
    Blockly.JavaScript.ORDER_ATOMIC,
  );
  var angle = Blockly.JavaScript.valueToCode(
    block,
    'ANGLE',
    Blockly.JavaScript.ORDER_ATOMIC,
  );
  return `steps.push([${leg}, ${angle}].join(' '));\n`;
};

Blockly.Blocks['robot_leg'] = {
  init() {
    this.jsonInit({
      message0: 'leg #%1',
      args0: [
        {
          type: 'input_value',
          name: 'INDEX',
          check: 'Number',
        },
      ],
      output: 'Leg',
      colour: 140,
    });
  },
};
Blockly.JavaScript['robot_leg'] = function(block) {
  var index = Blockly.JavaScript.valueToCode(
    block,
    'INDEX',
    Blockly.JavaScript.ORDER_ATOMIC,
  );
  return [`'l' + ${index}`, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['robot_knee'] = {
  init() {
    this.jsonInit({
      message0: 'knee #%1',
      args0: [
        {
          type: 'input_value',
          name: 'INDEX',
          check: 'Number',
        },
      ],
      output: 'Leg',
      colour: 190,
    });
  },
};
Blockly.JavaScript['robot_knee'] = function(block) {
  var index = Blockly.JavaScript.valueToCode(
    block,
    'INDEX',
    Blockly.JavaScript.ORDER_ATOMIC,
  );
  return [`'k' + ${index}`, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['robot_wait'] = {
  init() {
    this.jsonInit({
      message0: 'delay %1 ms',
      args0: [
        {
          type: 'input_value',
          name: 'TIME',
          check: 'Number',
        },
      ],
      previousStatement: null,
      nextStatement: null,
      inputsInline: true,
      tooltip: 'Wait a bit of time in milliseconds',
      colour: 210,
    });
  },
};
Blockly.JavaScript['robot_wait'] = function(block) {
  var time = Blockly.JavaScript.valueToCode(
    block,
    'TIME',
    Blockly.JavaScript.ORDER_ATOMIC,
  );
  return `steps.push('d ' + ${time});\n`;
};

Blockly.Blocks['robot_angle'] = {
  init() {
    this.jsonInit({
      message0: 'angle %1',
      args0: [
        {
          type: 'field_angle',
          name: 'ANGLE',
          angle: 90,
        },
      ],
      output: 'Number',
      colour: 50,
    });
  },
};
Blockly.JavaScript['robot_angle'] = function(block) {
  var angle = block.getFieldValue('ANGLE');
  if (angle > 180) {
    angle = angle - 360;
  }
  return [angle, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Blocks['robot_leg_count'] = {
  init() {
    this.jsonInit({
      message0: 'leg count',
      output: 'Number',
      colour: 300,
    });
  },
};
Blockly.JavaScript['robot_leg_count'] = function(block) {
  return [4, Blockly.JavaScript.ORDER_NONE];
};
