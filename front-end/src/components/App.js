import React, { Component, Fragment } from 'react';
import { Button, Intent } from '@blueprintjs/core';
import { Flex, Box } from 'grid-styled';
import styled from 'styled-components';
import qs from 'qs';

import BlocklyWorkspace from './BlocklyWorkspace';
import Toolbox from './Toolbox';

import './blocks';

/* global Blockly */

const FullScreen = styled(Flex)`
  height: 100%;
`;
const FullScreenWorkspace = styled(BlocklyWorkspace)`
  height: 100%;
`;
const PreFill = styled.pre`
  margin-bottom: 20px;
  overflow: scroll;
  flex: 1;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Commands = [
  {
    id: 'forward1',
    title: 'Forever Forward!',
  },
  {
    id: 'horse',
    title: 'Horse! Tprruuuuu',
  },
  {
    id: 'reverseHorse',
    title: 'Same as above, reversed',
  },
  {
    id: 'wiggle',
    title: 'Random dancing',
  },
  {
    id: 'reset',
    title: 'reset',
    icon: 'refresh',
    intent: Intent.WARNING,
  },
];

class App extends Component {
  state = {
    program: '',
  };

  commandSender(cmd) {
    return () => fetch(`/api/${cmd}`);
  }

  handleSendProgram = () => {
    const { program } = this.state;
    fetch(`/api/execute?${qs.stringify({ program })}`);
  };

  handleWorkspaceChange = workspace => {
    const xml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));
    localStorage.quadroXML = xml;

    const code = Blockly.JavaScript.workspaceToCode(workspace);
    let program = '';
    try {
      // eslint-disable-next-line no-new-func
      program = new Function(`
        var steps = [];
        ${code}
        return steps.join('\\n');
      `)();
    } catch (error) {
      program = `Failed: ${error}\n${code}`;
    }
    this.setState({
      program,
      code,
    });
  };

  render() {
    const { program, code } = this.state;
    return (
      <FullScreen>
        <Box flex="1" m={4} mr={0}>
          <FullScreenWorkspace
            toolbox={Toolbox}
            initialXML={localStorage.quadroXML}
            onWorkspaceChange={this.handleWorkspaceChange}
            workspaceConfiguration={{
              zoom: {
                controls: true,
                wheel: true,
              },
              grid: {
                spacing: 20,
                length: 3,
                colour: '#ccc',
                snap: true,
              },
            }}
          />
        </Box>
        <Flex flexDirection="column" width={1 / 5} m={4}>
          <Button
            className="pt-fill"
            icon="rocket"
            intent={Intent.SUCCESS}
            onClick={this.handleSendProgram}
          >
            Run
          </Button>
          <PreFill>{program}</PreFill>
          {Commands.map(cmd => (
            <Fragment key={cmd.id}>
              <Button
                className="pt-fill"
                icon={cmd.icon}
                intent={cmd.intent || Intent.NONE}
                onClick={this.commandSender(cmd.id)}
              >
                {cmd.title}
              </Button>
              <br />
            </Fragment>
          ))}
          <PreFill>{code}</PreFill>
          <Button
            className="pt-fill"
            icon="power"
            intent={Intent.DANGER}
            onClick={this.commandSender('poweroff')}
          >
            Shut Down
          </Button>
        </Flex>
      </FullScreen>
    );
  }
}

export default App;
