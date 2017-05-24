import React, { PropTypes } from 'react';
import { connect } from 'dva';
import Modal from 'antd/lib/modal';
import Button from 'antd/lib/button';

import i18n from 'i18n-renderer-nowa';

const OverwriteModal = ({
  showModal,
  overwriteFiles,
  dispatch
}) => {
  const onCancel = () => dispatch({
    type: 'projectCreate/changeStatus',
    payload: { showOverwriteModal: false }
  });

  const onOverride = () => dispatch({
    type: 'projectCreate/copyFilesToTarget',
  });

  return (
    <Modal
      title={i18n('template.setting.modal.title')}
      className="modal-overwrite"
      visible={showModal}
      onCancel={onCancel}
      footer={[
        <Button key="onCancel" onClick={onCancel}>{i18n('form.cancel')}</Button>,
        <Button key="onOverride" type="primary" onClick={onOverride}>{i18n('form.override')}</Button>,
      ]}
    >
      <ul className="modal-overwrite-filelist">
        {
          overwriteFiles.map(item => <li key={item}>{item}</li>)
        }
      </ul>
    </Modal>
  );
}

OverwriteModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  overwriteFiles: PropTypes.array,
};

export default connect(({ projectCreate }) => ({
  showModal: projectCreate.showOverwriteModal,
  overwriteFiles: projectCreate.overwriteFiles,
}))(OverwriteModal);
