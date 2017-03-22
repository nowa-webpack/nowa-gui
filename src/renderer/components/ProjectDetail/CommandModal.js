import React, { Component, PropTypes } from 'react';
import Modal from 'antd/lib/modal';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Message from 'antd/lib/message';
import i18n from 'i18n';
import { NAME_MATCH } from 'gui-const';

class CommandModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cmdName: '',
      cmdValue: '',
    };
  }
  handleOk() {
    const { cmdName, cmdValue } = this.state;
    const { dispatch, commands } = this.props;

    if (!(NAME_MATCH.test(cmdName))) {
      Message.error(i18n('msg.invalidName'));
      return false;
    }

    if (commands.filter(cmd => cmd === cmdName).length > 0) {
      Message.error(i18n('msg.existed'));
      return false;
    }

    if (!cmdValue) {
      Message.error(i18n('msg.invalidName'));
      return false;
    }

    dispatch({
      type: 'task/addSingleCommand',
      payload: {
        cmd: { name: cmdName, value: cmdValue }
      }
    });
     
    this.props.hideModal();
  }

  hideModal() {
    this.setState({
      cmdName: '',
      cmdValue: '',
    });
    this.props.hideModal();
  }

  render() {
    const { cmdName, cmdValue } = this.state;
    const { showModal } = this.props;
    return(
      <Modal
        title={i18n('cmd.modal.title')}
        visible={showModal}
        onOk={() => this.handleOk()} 
        onCancel={() => this.hideModal()}
        wrapClassName="cmd-modal"
        okText={i18n('form.ok')}
        cancelText={i18n('form.cancel')}
      >
        <form className="cmd-form" >
          <Row justify="space-between" type="flex">
          <Col span={6} className="cmd-field">
            <label className="form-label">{i18n('cmd.meta.name')}:</label>
            <input type="text" className="lg"
              onChange={e => this.setState({ cmdName: e.target.value })} value={cmdName}
            />
          </Col>
          <Col span={17} className="cmd-field">
            <label className="form-label">{i18n('cmd.meta.value')}:</label>
            <input type="text" className="lg"
              onChange={e => this.setState({ cmdValue: e.target.value })} value={cmdValue}
            />
          </Col>
          </Row>
        </form>
      </Modal>
    );
  }
}

export default CommandModal;