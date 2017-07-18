import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import { remote } from 'electron';
import Message from 'antd/lib/message';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import { join } from 'path';
import fs from 'fs-extra';

import i18n from 'i18n';

const OverrideModal = ({ showModal, overrideFiles, onOverride, dispatch }) => {

  const onCancel = () => dispatch({
    type: 'init/changeStatus',
    payload: { showFormModal: false }
  });

  return(
    <Modal
      title={i18n('template.setting.modal.title')}
      className="override-modal"
      visible={showModal}
      onCancel={onCancel}
      footer={[
        <Button key="onCancel" onClick={onCancel}>{i18n('form.cancel')}</Button>,
        <Button key="onOverride" type="primary" onClick={onOverride}>{i18n('form.override')}</Button>,
      ]}
    >
      <ul className="update-tip">{
        overrideFiles.map(item => <li key={item}>{item}</li>)
      }</ul>
    </Modal>
  );
}

OverrideModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  overrideFiles: PropTypes.array,
  onOverride: PropTypes.func.isRequired,
  // userAnswers: PropTypes.object.isRequired,
};

export default connect(({ init }) => ({
  showModal: init.showFormModal,
  overrideFiles: init.overrideFiles,
}))(OverrideModal);
