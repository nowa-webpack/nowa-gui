import React, { Component, PropTypes } from 'react';
import Modal from 'antd/lib/modal';
import Input from 'antd/lib/input';

import i18n from 'i18n';

class NewPackageModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      packageName: '',
    };
  }

  render() {

    const { showModal, onHideModal, onHandleOK } = this.props;
    const { packageName } = this.state;

    return (
      <Modal
        title={i18n('package.btn.install')}
        visible={showModal}
        onOk={() => onHandleOK(packageName)} 
        onCancel={() => onHideModal()}
        wrapClassName="set-modal"
        okText={i18n('form.ok')}
        cancelText={i18n('form.cancel')}
      >
        <form className="ui-form" >
          <div className="form-item">
            <label className="form-label">{i18n('package.name')}:</label>
            <Input className="lg"
              onChange={e => this.setState({ packageName: e.target.value })}
              value={packageName}
            />
          </div>
        </form>
      </Modal>
    );
  }
}

NewPackageModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  onHideModal: PropTypes.func.isRequired,
  onHandleOK: PropTypes.func.isRequired,
};

export default NewPackageModal;
