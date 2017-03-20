import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import { remote } from 'electron';
import Message from 'antd/lib/message';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import { join } from 'path';
import fs from 'fs-extra';

import i18n from 'i18n';
// const { command } = remote.getGlobal('services');
// const { registry } = remote.getGlobal('config');

const OverrideModal = ({ showModal, overrideFiles, onOverride, userAnswers, dispatch }) => {

  const onCancel = () => dispatch({
    type: 'init/changeStatus',
    payload: { showFormModal: false }
  });
  /*const onImport = () => {
    dispatch({
      type: 'project/importProj',
      payload: {
        filePath: userAnswers.projPath,
        needInstall: true
      }
    });
    onCancel();
    const installOptions = {
      root: userAnswers.projPath,
      registry: registry(),
      targetDir: userAnswers.projPath,
      storeDir: join(userAnswers.projPath, '.npminstall'),
      // cacheDir: null,
      timeout: 5 * 60000,
      // pkgs,
    };
    const term = command.installModules(installOptions);

    term.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    term.stderr.on('data', (data) => {
      console.log(data.toString());
    });

    term.on('exit', (code) => {
      if (!code) {
        console.log('exit import installing');
      }
    });
  };*/


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

// <Button key="onImport" type="primary" onClick={onImport}>{i18n('form.import')}</Button>,


OverrideModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  overrideFiles: PropTypes.array,
  onOverride: PropTypes.func.isRequired,
  userAnswers: PropTypes.object.isRequired,
};


export default connect(({ init }) => ({
  showModal: init.showFormModal,
  overrideFiles: init.overrideFiles,
  userAnswers: init.userAnswers,
}))(OverrideModal);