import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import Modal from 'antd/lib/modal';
import Tabs from 'antd/lib/tabs';

import i18n from 'i18n-renderer-nowa';
import { delay } from 'shared-nowa';
import LocalForm from './LocalForm';
import RemoteForm from './RemoteForm';

const TabPane = Tabs.TabPane;


class NewBoilerplateModal extends Component {
  constructor(props) {
    super(props);
    this.remote = props.remoteItem || {};
    this.local = props.localItem || {};

    this.state = {
      showModal: props.showModal,
      tabKey: 'local',
    };

    this.hideModal = this.hideModal.bind(this);
    this.handleOk = this.handleOk.bind(this);
    this.changeLocal = this.changeLocal.bind(this);
    this.changeRemote = this.changeRemote.bind(this);
  }

  componentWillReceiveProps(next) {
    const { showModal, selectType } = this.props;

    if (next.showModal !== showModal || next.selectType !== selectType) {
      this.remote = next.remoteItem || {};
      this.local = next.localItem || {};

      this.setState({
        showModal: next.showModal,
        tabKey: next.selectType === 'remote' ? 'remote' : 'local',
      });
    }
  }


  handleOk() {
    const { selectType, dispatch } = this.props;
    const localFlag = Object.keys(this.local).length > 0;
    const remoteFlag = Object.keys(this.remote).length > 0;
    const type = selectType === 'new' ? 'new' : 'edit';

    if (localFlag) {
      dispatch({
        type: `boilerplate/${type}Local`,
        payload: this.local
      });
    }

    if (remoteFlag) {
      dispatch({
        type: `boilerplate/${type}Remote`,
        payload: this.remote
      });
    }

    this.hideModal();
  }

  hideModal() {
    this.props.dispatch({
      type: 'boilerplate/changeStatus',
      payload: {
        showAddBoilerplateModal: false,
        editLocalBoilplateData: {},
        editRemoteBoilplateData: {},
      }
    });
    delay(500).then(() => this.props.dispatch({
      type: 'boilerplate/changeStatus',
      payload: {
        addOrEditBoilerplateType: 'new',
      }
    }));
    this.remote = {};
    this.local = {};
  }

  changeLocal(props) {
    this.local = { ...this.local, ...props };
  }

  changeRemote(props) {
    this.remote = { ...this.remote, ...props };
  }

  render() {
    const { showModal, tabKey } = this.state;
    const { selectType, localItem, remoteItem } = this.props;
    let mainbody;

    const localPane = (
        <TabPane tab={i18n('template.modal.local.title')} key="local">
          <LocalForm onChangeData={this.changeLocal} data={localItem} />
        </TabPane>
      );

    const remotePane = (
        <TabPane tab={i18n('template.modal.remote.title')} key="remote">
          <RemoteForm onChangeData={this.changeRemote} data={remoteItem} />
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
  localItem: PropTypes.object,
  remoteItem: PropTypes.object,
};


export default connect(state => ({
  showModal: state.boilerplate.showAddBoilerplateModal,
  localItem: state.boilerplate.editLocalBoilplateData,
  remoteItem: state.boilerplate.editRemoteBoilplateData,
  selectType: state.boilerplate.addOrEditBoilerplateType,
}))(NewBoilerplateModal);
