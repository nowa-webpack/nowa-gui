import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import { remote } from 'electron';
import Message from 'antd/lib/message';
import Modal from 'antd/lib/modal';
import Tabs from 'antd/lib/tabs';
import uuidV4 from 'uuid/v4';
import { join } from 'path';
import fs from 'fs-extra';


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
    this.remoteObj = props.item.name ? props.item : getBasicRemoteObj();
    this.localObj = props.item.name ? props.item : getBasicLocalObj();

    this.state = {
      showModal: props.showModal,
    };

    this.hideModal = this.hideModal.bind(this);
  }

  componentWillReceiveProps(next) {
    const { showModal } = this.props;

    if (next.showModal !== showModal) {
      this.remoteObj = getBasicRemoteObj();
      this.localObj = getBasicLocalObj();
      if (next.tabType === 2) {
        this.localObj = next.item;
      }

      if (next.tabType === 3) {
        this.remoteObj = next.item;
      }

      this.setState({
        showModal: next.showModal,
      });
    }
  }

  hideModal() {
    this.props.dispatch({ type: 'init/changeStatus',
      payload: { showTemplateModal: false } });

    setTimeout(() => {
      this.props.dispatch({ type: 'init/changeStatus',
        payload: { templateModalTabType: 1 } });
    }, 500);
  }

  handleOk() {
    const { dispatch, tabType } = this.props;
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

      if (tabType === 1) {
        if (manifest.remote) {
          const filter = manifest.remote.filter(item => item.remote === remotePath || item.name === remoteName);

          if (filter.length > 0) {
            Message.error(`Remote Url or Name is ${i18n('msg.existed')}`);
            return false;
          }
        }
        this.remoteObj.id = uuidV4();
        this.remoteObj.loading = true;
        dispatch({
          type: 'init/addCustomRemoteTemplate',
          payload: {
            item: this.remoteObj
          }
        });
       
      } else {
        application.editCustomTemplates({
          type: 'remote',
          item: this.remoteObj,
        });
      }
    }

    if (localPath) {
      const localName = this.localObj.name;

      if (!(NAME_MATCH.test(localName))) {
        Message.error(i18n('msg.invalidName'));
        return false;
      }

      if (!fs.existsSync(join(localPath, 'proj'))) {
        Message.error(i18n('msg.invalidTemplate'));
        return false;
      }

      if (tabType === 1) {
        if (manifest.local) {
          const filter = manifest.local.filter(item => item.path === localPath || item.name === localName);

          if (filter.length > 0) {
            Message.error(`Local Url or Name is ${i18n('msg.existed')}`);
            return false;
          }
        }
        this.localObj.id = uuidV4();
        this.localObj.disable = false;
        application.addCustomTemplates({
          type: 'local',
          item: this.localObj,
        });
      } else {
        application.editCustomTemplates({
          type: 'local',
          item: this.localObj,
        });
      }
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
    const { tabType } = this.props;
    let mainbody, key = '1';

    const localPane = (
        <TabPane tab={i18n('template.modal.local.title')} key="1">
          <LocalForm
            data={this.localObj}
            onChangeData={this.changeLocalObj.bind(this)}
          />
        </TabPane>
      );

    const remotePane = (
        <TabPane tab={i18n('template.modal.remote.title')} key="2">
          <RemoteForm
            data={this.remoteObj}
            onChangeData={this.changeRemoteObj.bind(this)}
          />
        </TabPane>
      );
    if (tabType === 3) {
      mainbody = remotePane;
      key = '2';
    } else if (tabType === 2) {
      mainbody = localPane;
    } else {
      mainbody = [localPane, remotePane];
    }

    return (
      <Modal
        title={i18n('template.modal.title')}
        visible={showModal}
        onOk={this.handleOk.bind(this)}
        onCancel={this.hideModal}
        okText={i18n('form.ok')}
        cancelText={i18n('form.cancel')}
      >
        <Tabs defaultActiveKey={key} size="small">
          { mainbody }
        </Tabs>
      </Modal>
    );
  }
}
/*
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
          </TabPane>*/

CustomModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  tabType: PropTypes.number.isRequired,
  item: PropTypes.object
};

// export default CustomModal;

export default connect(({ init }) => ({
  showModal: init.showTemplateModal,
  item: init.editTemplate,
  tabType: init.templateModalTabType,
}))(CustomModal);