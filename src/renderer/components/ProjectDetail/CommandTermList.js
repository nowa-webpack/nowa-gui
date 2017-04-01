import React, { Component, PropTypes } from 'react';
import Button from 'antd/lib/button';
import i18n from 'i18n';

import CommandModal from './CommandModal';

class CommandTermList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
    };
  }

  startCmd(type) {
    const { dispatch, name } = this.props;
    dispatch({
      type: 'task/execCustomCmd',
      payload: { type, name }
    });
  }

  stopCmd(type) {
    const { dispatch, name } = this.props;
    dispatch({
      type: 'task/stopCustomCmd',
      payload: { type, name }
    });
  }

  removeCmd(cmd) {
    this.props.dispatch({
      type: 'task/removeSingleCommand',
      payload: {
        cmd
      }
    });
  }

  showModal() {
    this.setState({ showModal: true });
  }

  hideModal() {
    this.setState({ showModal: false });
  }

  render() {
    const { commands, dispatch } = this.props;

    const modalProps = {
      showModal: this.state.showModal,
      hideModal: this.hideModal.bind(this),
      dispatch,
      commands
    };

    return (
      <div className="cmd-sider">
        <h3>{i18n('cmd.sider.title')}</h3>
        <Button
          icon="plus"
          type="primary"
          shape="circle"
          size="small"
          className="add-cmd-btn"
          onClick={() => this.showModal()}
        />
        { commands.map(cmd =>
          <div className="cmd-item" key={cmd}>
            {cmd}
            <i className="iconfont icon-close-o" onClick={() => this.removeCmd(cmd)} />
            <i className="iconfont icon-stop" onClick={() => this.stopCmd(cmd)} />
            <i className="iconfont icon-play" onClick={() => this.startCmd(cmd)} />
          </div>)}
        <CommandModal {...modalProps} />
      </div>
    );
  }
}

CommandTermList.propTypes = {
  name: PropTypes.string.isRequired,
  commands: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default CommandTermList;
