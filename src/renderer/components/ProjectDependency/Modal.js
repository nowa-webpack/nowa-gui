import React, { PropTypes } from 'react';
import Modal from 'antd/lib/modal';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';

import i18n from 'i18n-renderer-nowa';

const FormItem = Form.Item;


const NewPackageModal = ({
  showModal,
  onHandleOK,
  onHideModal,
  form: {
    getFieldDecorator,
    validateFields,
  }
}) => {
  const onOk = () => {
    validateFields((errors, names) => {
      if (!errors) {
        onHandleOK(names);
      }
    });
  };

  return (
    <Modal
      title={i18n('package.btn.install')}
      visible={showModal}
      onOk={onOk}
      onCancel={onHideModal}
      okText={i18n('form.ok')}
      cancelText={i18n('form.cancel')}
    >
      <Form
        layout="horizontal"
        style={{ marginTop: 15 }}
      >
        <FormItem
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 16 }}
          label={i18n('package.name')}
        >{getFieldDecorator('name', {
          rules: [{ required: true, message: i18n('msg.required') }]
        })(<Input placeholder="package, [package]" />)}
        </FormItem>
      </Form>
    </Modal>
  );
};


NewPackageModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  onHideModal: PropTypes.func.isRequired,
  onHandleOK: PropTypes.func.isRequired,
  form: PropTypes.shape({
    getFieldDecorator: PropTypes.func,
    validateFields: PropTypes.func,
  }).isRequired, 
};

export default Form.create()(NewPackageModal);
