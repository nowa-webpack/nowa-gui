import React, { Component } from 'react';
// import { connect } from 'dva';

import i18n from 'i18n-renderer-nowa';

import Terminal from './Terminal';
import CommandList from './CommandList';


class ConsoleWrap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      showModal: false,
    };

    this.onToggleConsole = this.onToggleConsole.bind(this);
  }

  componentWillReceiveProps() {
    
  }

  onToggleConsole() {
    const { expanded } = this.state;
    this.setState({ expanded: !expanded });
  }

  onShowModal = () => {
    this.setState({ showModal: true });
  }

  render() {
    const { expanded } = this.state;
    return (
      <div className="project-console">
        <Terminal onToggle={this.onToggleConsole} expanded={expanded} />
        <CommandList visible={!this.state.expanded} onShowModal={this.onShowModal} />
      </div>
    );
  }
}

export default ConsoleWrap;
