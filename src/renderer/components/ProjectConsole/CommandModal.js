import React, { PropTypes } from 'react';
import { connect } from 'dva';
import Modal from 'antd/lib/modal';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import i18n from 'i18n-renderer-nowa';
import { NAME_MATCH } from 'const-renderer-nowa';

const FormItem = Form.Item;

const CommandModal = ({
  showModal,
  onHideModal,
  current: { path },
  commandSet,
  form: {
    getFieldDecorator,
    validateFields,
    setFieldsValue,
  },
  dispatch
}) => {
  const cmdNames = Object.keys(commandSet[path] || {});
  const handleOk = () => {
    validateFields((err, data) => {
      if (!err) {
        console.log(data);
        dispatch({
          type: 'task/addCommand',
          payload: data
        });
        onHideModal();
        setFieldsValue({ name: '', value: '' });
      }
    });
  };

  const nameValid = (rule, value, callback) => {
    if (!(NAME_MATCH.test(value))) {
      callback(i18n('msg.invalidName'));
    }
    if (cmdNames.filter(cmd => cmd === value).length) {
      callback(i18n('msg.existed'));
    }
    callback();
  };

  return (
    <Modal
      title={i18n('cmd.modal.title')}
      visible={showModal}
      onOk={handleOk}
      onCancel={onHideModal}
      okText={i18n('form.ok')}
      cancelText={i18n('form.cancel')}
    >
      <Form layout="vertical">
        <Row>
          <Col span={6} offset={1}>
            <FormItem
              label={i18n('cmd.meta.name')}
              required
            >
              {getFieldDecorator('name', {
                rules: [{ required: true, message: i18n('msg.required') },
                  { validator: nameValid }]
              })(<Input />)}
            </FormItem>
            </Col>
            <Col span={15} offset={1}>
            <FormItem
              label={i18n('cmd.meta.value')}
              required
            >
              {getFieldDecorator('value', {
                rules: [{ required: true, message: i18n('msg.required') }]
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};


CommandModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  commandSet: PropTypes.object.isRequired,
  current: PropTypes.shape({
    path: PropTypes.string.isRequired,
  }).isRequired,
  onHideModal: PropTypes.func.isRequired,
  form: PropTypes.shape({
    getFieldDecorator: PropTypes.func,
    setFieldsValue: PropTypes.func,
    validateFields: PropTypes.func,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default Form.create()(connect(({ project, task }) => ({
  current: project.current,
  commandSet: task.commandSet || {},
}))(CommandModal));
