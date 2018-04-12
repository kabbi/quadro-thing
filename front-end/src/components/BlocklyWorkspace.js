import React from 'react';

/* global Blockly */

function debounce(func, wait) {
  let timeout;

  return function debouncedFunction(...args) {
    const context = this;
    const later = function later() {
      timeout = null;
      func.apply(context, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

class BlocklyWorkspace extends React.Component {
  state = {
    xml: this.props.initialXML,
  };

  workspace = null;

  componentDidMount() {
    // TODO figure out how to use setState here without breaking the toolbox when switching tabs
    this.workspace = Blockly.inject(this.editorDiv, {
      ...this.props.workspaceConfiguration,
      toolbox: this.props.toolbox,
    });

    if (this.state.xml) {
      if (this.importFromXml(this.state.xml)) {
        this.onXMLChange();
      } else {
        this.setState({ xml: null }, this.onXMLChange);
      }
    }

    this.workspace.addChangeListener(this.workspaceDidChange);

    this.workspace.addChangeListener(
      debounce(() => {
        const newXml = Blockly.Xml.domToText(
          Blockly.Xml.workspaceToDom(this.workspace),
        );
        if (newXml === this.state.xml) {
          return;
        }

        this.setState({ xml: newXml }, this.onXMLChange);
      }, 200),
    );
  }

  shouldComponentUpdate() {
    return false;
  }

  componentWillUnmount() {
    if (this.workspace) {
      this.workspace.dispose();
    }
  }

  importFromXml(xml) {
    try {
      Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), this.workspace);
      return true;
    } catch (e) {
      if (this.props.onImportXmlError) {
        this.props.onImportXmlError(e);
      }
      return false;
    }
  }

  onXMLChange = () => {
    if (this.props.onXMLChange) {
      this.props.onXMLChange(this.state.xml);
    }
  };

  workspaceDidChange = () => {
    if (this.props.onWorkspaceChange) {
      this.props.onWorkspaceChange(this.workspace);
    }
  };

  resize = () => {
    Blockly.svgResize(this.workspace);
  };

  saveEditor = editor => {
    this.editorDiv = editor;
  };

  render() {
    const { className } = this.props;
    return <div className={className} ref={this.saveEditor} />;
  }
}

export default BlocklyWorkspace;
