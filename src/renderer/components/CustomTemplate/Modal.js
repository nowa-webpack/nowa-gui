import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import { remote } from 'electron';
import Message from 'antd/lib/message';
import Modal from 'antd/lib/modal';
import Tabs from 'antd/lib/tabs';
import uuidV4 from 'uuid/v4';


import i18n from 'i18n';
import { URL_MATCH, NAME_MATCH } from 'gui-const';
import {
  getLocalCustomTemps, setLocalCustomTemps, getRemoteTemps, setRemoteTemps
} from 'gui-local';
import LocalForm from './LocalForm';
import RemoteForm from './RemoteForm';

const { application } = remote.getGlobal('services');

const TabPane = Tabs.TabPane;

const getBasicRemoteObj = () => ({
  name: '',
  description: '',
  path: '',
  remote: '',
  type: 'CUSTOM_REMOTE'
});

const getBasicLocalObj = () => ({
  name: '',
  description: '',
  path: '',
  remote: '',
  type: 'CUSTOM_LOCAL'
});

class CustomModal extends Component {
  constructor(props) {
    super(props);
    this.remoteObj = getBasicRemoteObj();
    this.localObj = getBasicLocalObj();

    this.state = {
      showModal: props.showModal,
    };

    this.hideModal = this.hideModal.bind(this);
    this.changeLocalObj = this.changeLocalObj.bind(this);
    this.changeRemoteObj = this.changeRemoteObj.bind(this);
    this.handleOk = this.handleOk.bind(this);
  }

  componentWillReceiveProps(next) {
    const { showModal } = this.props;

    if (next.showModal !== showModal) {
      this.setState({
        showModal: next.showModal,
      });
    }
  }

  hideModal() {
    this.props.dispatch({ type: 'init/changeStatus', payload: { showTemplateModal: false } });
  }

  handleOk() {
    const { dispatch } = this.props;
    const remotePath = this.remoteObj.remote;
    const localPath = this.localObj.path;
    const manifest = application.getMainifest();

    if (remotePath) {
      const remoteName = this.remoteObj.name;

      if (!URL_MATCH.test(remotePath)) {
        Message.error(i18n('msg.invalidUrl'));
        return false;
      }

      if (!(NAME_MATCH.test(remoteName))) {
        Message.error(i18n('msg.invalidName'));
        return false;
      }

      if (manifest.remote) {
        const filter = manifest.remote.filter(item => item.remote === remotePath || item.name === remoteName);

        if (filter.length > 0) {
          Message.error(`Remote Url or Name is ${i18n('msg.existed')}`);
          return false;
        }
      }

      this.remoteObj.id = uuidV4();

      application.addCustomTemplates({
        type: 'remote',
        item: this.remoteObj,
      });

      
    }

    if (localPath) {
      if (!(NAME_MATCH.test(this.localObj.name))) {
        Message.error(i18n('msg.invalidName'));
        return false;
      }

      const localTemps = getLocalCustomTemps();

      const filter = localTemps.filter(item => item.path === localPath);

      if (filter.length > 0) {
        Message.error(`Local Path ${i18n('msg.existed')}`);
        return false;
      }

      localTemps.push(this.remoteObj);
      setLocalCustomTemps(localTemps);
      dispatch({
        type: 'init/fetchCustomLocalTemplates',
        payload: { localTemps }
      });
    }

    this.remoteObj = getBasicRemoteObj();
    this.localObj = getBasicLocalObj();

    this.hideModal();
  }


  changeLocalObj(props) {
    this.localObj = { ...this.localObj, ...props };
  }

  changeRemoteObj(props) {
    this.remoteObj = { ...this.remoteObj, ...props };
  }

  render() {
    const { showModal } = this.state;

    return (
      <Modal
        title={i18n('template.modal.title')}
        visible={showModal}
        onOk={this.handleOk} 
        onCancel={this.hideModal}
        okText={i18n('form.ok')}
        cancelText={i18n('form.cancel')}
      >
        <Tabs defaultActiveKey="1" size="small">
          <TabPane tab={i18n('template.modal.local.title')} key="1">
            <LocalForm
              data={this.localObj}
              onChangeData={this.changeLocalObj}
            />
          </TabPane>
          <TabPane tab={i18n('template.modal.remote.title')} key="2">
            <RemoteForm
              data={this.remoteObj}
              onChangeData={this.changeRemoteObj}
            />
          </TabPane>
        </Tabs>
      </Modal>
    );
  }
}

CustomModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect(({ init }) => ({
  showModal: init.showTemplateModal,
}))(CustomModal);