/*
  控制台页面
*/
import React, { Component } from 'react';

import Terminal from './Terminal';
import CommandList from './CommandList';
import CommandModal from './CommandModal';


class ConsoleWrap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      showModal: false,
    };

    this.onToggleConsole = this.onToggleConsole.bind(this);
  }

  onToggleConsole() {
    const { expanded } = this.state;
    this.setState({ expanded: !expanded });
  }

  onShowModal = () => {
    this.setState({ showModal: true });
  }

  onHideModal = () => {
    this.setState({ showModal: false });
  }

  render() {
    const { expanded, showModal } = this.state;
    return (
      <div className="project-console">
        <Terminal onToggle={this.onToggleConsole} expanded={expanded} />
        <CommandList visible={!this.state.expanded} onShowModal={this.onShowModal} />
        <CommandModal showModal={showModal} onHideModal={this.onHideModal} />
      </div>
    );
  }
}

export default ConsoleWrap;
