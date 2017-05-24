import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
// import Message from 'antd/lib/message';
import Modal from 'antd/lib/modal';
import Tabs from 'antd/lib/tabs';
import { join } from 'path';
import { existsSync } from 'fs-extra';

import i18n from 'i18n-renderer-nowa';
import { msgError, msgInfo } from 'util-renderer-nowa';
import { URL_MATCH, NAME_MATCH } from 'const-renderer-nowa';
import LocalForm from './LocalForm';
import RemoteForm from './RemoteForm';

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

class NewBoilerplateModal extends Component {
  constructor(props) {
    super(props);
    this.remoteObj = props.item.name ? props.item : getBasicRemoteObj();
    this.localObj = props.item.name ? props.item : getBasicLocalObj();

    this.state = {
      showModal: props.showModal,
      tabKey: 'local',
    };

    this.hideModal = this.hideModal.bind(this);
    this.handleOk = this.handleOk.bind(this);
    this.changeLocalObj = this.changeLocalObj.bind(this);
    this.changeRemoteObj = this.changeRemoteObj.bind(this);
  }

  componentWillReceiveProps(next) {
    const { showModal, selectType } = this.props;

    if (next.showModal !== showModal || next.selectType !== selectType) {
      this.remoteObj = getBasicRemoteObj();
      this.localObj = getBasicLocalObj();

      if (next.selectType === 'local') {
        this.localObj = next.item;
      }

      if (next.selectType === 'remote') {
        this.remoteObj = next.item;
      }

      this.setState({
        showModal: next.showModal,
        tabKey: next.selectType === 'remote' ? 'remote' : 'local',
      });
    }
  }

  handleOk() {
    const { dispatch, selectType } = this.props;
    const remotePath = this.remoteObj.remote;
    const localPath = this.localObj.path;
    const remoteName = this.remoteObj.name;
    const localName = this.localObj.name;
    const type = selectType === 'new' ? 'new' : 'edit';

    let isDirty = false;

    if (remotePath || remoteName) {
      isDirty = true;
      if (!(NAME_MATCH.test(this.remoteObj.name))) {
        msgError(i18n('msg.invalidName'));
        return false;
      }
      if (!URL_MATCH.test(remotePath)) {
        msgError(i18n('msg.invalidUrl'));
        return false;
      }

      dispatch({
        type: `boilerplate/${type}Remote`,
        payload: this.remoteObj
      });
    }

    if (localPath || localName) {
      isDirty = true;
      if (!(NAME_MATCH.test(this.localObj.name))) {
        msgError(i18n('msg.invalidName'));
        return false;
      }
      if (!existsSync(join(localPath, 'proj'))) {
        msgError(i18n('msg.invalidTemplate'));
        return false;
      }

      dispatch({
        type: `boilerplate/${type}Local`,
        payload: this.localObj
      });
    }

    if (isDirty) {
      this.hideModal();
    } else {
      msgInfo(i18n('msg.contentRequired'));
    }
  }

  hideModal() {
    this.props.dispatch({
      type: 'boilerplate/changeStatus',
      payload: {
        showAddBoilerplateModal: false, templateModalselectType: 'new'
      }
    });
    this.remoteObj = getBasicRemoteObj();
    this.localObj = getBasicLocalObj();
  }

  changeLocalObj(props) {
    this.localObj = { ...this.localObj, ...props };
  }

  changeRemoteObj(props) {
    this.remoteObj = { ...this.remoteObj, ...props };
  }

  render() {
    const { showModal, tabKey } = this.state;
    const { selectType } = this.props;
    let mainbody;

    const localPane = (
        <TabPane tab={i18n('template.modal.local.title')} key="local">
          <LocalForm
            data={this.localObj}
            onChangeData={this.changeLocalObj}
          />
        </TabPane>
      );

    const remotePane = (
        <TabPane tab={i18n('template.modal.remote.title')} key="remote">
          <RemoteForm
            data={this.remoteObj}
            onChangeData={this.changeRemoteObj}
          />
        </TabPane>
      );
    if (selectType === 'remote') {
      mainbody = [remotePane];
    } else if (selectType === 'local') {
      mainbody = [localPane];
    } else {
      mainbody = [localPane, remotePane];
    }

    return (
      <Modal
        title={i18n('template.modal.title')}
        visible={showModal}
        onOk={this.handleOk}
        onCancel={this.hideModal}
        okText={i18n('form.ok')}
        cancelText={i18n('form.cancel')}
      >
        <Tabs
          activeKey={tabKey}
          size="small"
          onChange={activeKey => this.setState({ tabKey: activeKey })}
        >
          { mainbody }
        </Tabs>
      </Modal>
    );
  }

}

NewBoilerplateModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  selectType: PropTypes.string.isRequired,
  item: PropTypes.object
};


export default connect(state => ({
  showModal: state.boilerplate.showAddBoilerplateModal,
  item: state.boilerplate.editBoilplateData,
  selectType: state.boilerplate.addOrEditBoilerplateType,
}))(NewBoilerplateModal);
