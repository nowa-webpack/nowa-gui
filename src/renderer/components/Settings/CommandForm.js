import React, { PropTypes } from 'react';
import Button from 'antd/lib/button';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';
import { connect } from 'dva';

import i18n from 'i18n-renderer-nowa';
import { NAME_MATCH } from 'const-renderer-nowa';

const FormItem = Form.Item;

const CommandForm = ({
  globalCommandSet,
  dispatch,
  form: { getFieldDecorator, setFieldsValue, validateFields },
}) => {
  const handleSubmit = () => {
    validateFields((err, data) => {
      if (!err) {
        console.log(data);
        dispatch({
          type: 'task/addGlobalCommand',
          payload: data,
        });
        setFieldsValue({ name: '', value: '' });
      }
    });
  };
  const nameValid = (rule, value, callback) => {
    if (!NAME_MATCH.test(value)) {
      callback(i18n('msg.invalidName'));
    }
    if (globalCommandSet.filter(({ name }) => name === value).length) {
      callback(i18n('msg.existed'));
    }
    callback();
  };

  return (
    <Form layout="vertical" className="setting-commands-form">
      <Row>
        <Col span={4} offset={0}>
          <FormItem label={i18n('cmd.meta.name')} required>
            {getFieldDecorator('name', {
              rules: [
                { required: true, message: i18n('msg.required') },
                { validator: nameValid },
              ],
            })(<Input />)}
          </FormItem>
        </Col>
        <Col span={14} offset={1}>
          <FormItem label={i18n('cmd.meta.value')} required>
            {getFieldDecorator('value', {
              rules: [{ required: true, message: i18n('msg.required') }],
            })(<Input />)}
          </FormItem>
        </Col>
        <Col span={3} offset={1}>
          <Button
            type="primary"
            size="large"
            className="setting-commands-submit"
            onClick={handleSubmit}
          >
            {i18n('form.add')}
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

CommandForm.propTypes = {
  globalCommandSet: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
  form: PropTypes.shape({
    getFieldDecorator: PropTypes.func,
    setFieldsValue: PropTypes.func,
    validateFields: PropTypes.func,
  }).isRequired,
};

export default Form.create()(connect(({ task }) => ({
  globalCommandSet: task.globalCommandSet || [],
}))(CommandForm));
