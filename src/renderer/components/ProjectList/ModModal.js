import React, { Component, PropTypes } from 'react';
import Modal from 'antd/lib/modal';
import { remote } from 'electron';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import { join } from 'path';
import fs from 'fs-extra';
import Message from 'antd/lib/message';
import i18n from 'i18n';
import { NAME_MATCH } from 'gui-const';

const { utils } = remote.getGlobal('services');

class ModMadal extends Component {
  constructor(props) {
    super(props);
    const types = fs.readdirSync(props.template).filter(dir => dir !== 'proj');
    
    this.state = {
      name: '',
      defaultType: types[0],
      types,
      prompts: this.getPrompts(props.template, types[0]),
      // cmdValue: '',
    };

    
  }
  componentWillReceiveProps({ filePath, template }) {
    if (filePath !== this.props.filePath && template) {
      const types = fs.readdirSync(template).filter(dir => dir !== 'proj');
      this.setState({
        // name: '',
        defaultType: types[0],
        types,
        prompts: this.getPrompts(template, types[0]),
      });
      // this.setState({
      //   cmdName: '',
      //   cmdValue: '',
      // });
    }
  }

  getPrompts(template, type) {
    const extendsArgs = { 
      name: 'Name',
      type: 'input'
      // message: `${type} name`
    };
    const promptsPath = join(template, `${type}.js`);
    const args = {};

    if (fs.existsSync(promptsPath)) {
      const prompts = utils.loadConfig(promptsPath).prompts;
      this.extendsArgs = [extendsArgs, ...prompts];
    } else {
      this.extendsArgs = [extendsArgs];
    }

    this.extendsArgs.forEach((item) => {
      const defaultv = item.type === 'confirm' ? false : '';
      args[item.name] = item.default || defaultv;
    });

    return args;
  }

  handleOk() {
    const { cmdName, cmdValue } = this.state;
    const { dispatch, commands, hideModal } = this.props;

    if (!(NAME_MATCH.test(cmdName))) {
      Message.error(i18n('msg.invalidName'));
      return false;
    }

    if (commands.filter(item => item.name === cmdName).length > 0) {
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
        cmd: { name: cmdName, cnt: cmdValue }
      }
    });
     
    hideModal();
  }

  hideModal() {
    this.props.dispatch({
      type: 'layout/changeStatus',
      payload: { showModModal: false }
    });
  }

  render() {
    const { prompts } = this.state;
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
        <form className="ui-form" >
         
        </form>
      </Modal>
    );
  }
}

ModMadal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  filePath: PropTypes.string.isRequired,
  template: PropTypes.string,
  // commands: PropTypes.array.isRequired,
  // hideModal: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default ModMadal;
