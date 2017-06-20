import React, { PropTypes } from 'react';
import { connect } from 'dva';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Form from 'antd/lib/form';
import Modal from 'antd/lib/modal';
import Input from 'antd/lib/input';
import Select from 'antd/lib/select';
import Switch from 'antd/lib/switch';
import Checkbox from 'antd/lib/checkbox';


import i18n from 'i18n-renderer-nowa';
import { NAME_MATCH } from 'const-renderer-nowa';

const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;

const formItemLayout = {
  labelCol: { span: 6, offset: 1 },
  wrapperCol: { span: 15 }
};

const PluginPromtsModal = ({
  showModal,
  onHideModal,
  form: {
    getFieldDecorator,
    validateFields,
    setFieldsValue,
  },
  data: { name, file = {} },
  lang,
  dispatch,
  projPath
}) => {
  const handleOk = () => {
    validateFields((err, answers) => {
      if (!err) {
        console.log(answers);
        dispatch({
          type: 'task/changeStatus',
          payload: { taskType: file.name.en }
        });
        dispatch({
          type: 'plugin/exec',
          payload: { answers, file, }
        });
        // file.tasks[0].do({ projPath, answers: data });
        onHideModal();
        // setFieldsValue({ name: '', value: '' });
      }
    });
  };

  const inputTemp = (obj) =>  {
    const rules = [{ required: true, message: i18n('msg.required') }];

    if (obj.validator) {
      const validator = (rule, value, callback) => {
        if (!obj.validator.func(value)) {
          callback(obj.validator.msg);
        }
        callback();
      };
      rules.push({ validator });
    }

    const options = {
      rules,
    };

    if (obj.default) {
      options.initialValue = obj.default;
    }

    return (
      <FormItem
        key={obj.key}
        {...formItemLayout}
        label={obj.label[lang]}
        required
      >
        {getFieldDecorator(obj.key, options)(<Input />)}
      </FormItem>
    );
  };

  const selectTemp = (obj) =>  {
    let options = {};
    if (obj.default) {
      options.initialValue = obj.default;
    }

    return (
      <FormItem
        key={obj.key}
        {...formItemLayout}
        label={obj.label[lang]}
        required
      >
        {getFieldDecorator(obj.key, options)(
          <Select>
            {
              obj.values.map(item =>
                <Select.Option key={item} value={item}>{item}</Select.Option>
              )
            }
          </Select>
        )}
      </FormItem>
    );
  };

  const switchTemp = (obj) =>  {
    let options = { valuePropName: 'checked' };
    if (obj.default) {
      options.initialValue = obj.default;
    }

    return (
      <FormItem
        key={obj.key}
        {...formItemLayout}
        label={obj.label[lang]}
        required
      >
        {getFieldDecorator(obj.key, options)(<Switch size="small" />)}
      </FormItem>
    );
  };

  const checkboxTemp = (obj) =>  {
    let options = {};
    if (obj.default) {
      options.initialValue = obj.default;
    }

    const opt = obj.values.map(item => ({ label: item, value: item }));

    return (
      <FormItem
        key={obj.key}
        {...formItemLayout}
        label={obj.label[lang]}
        required
      >
        {getFieldDecorator(obj.key, options)(
          <CheckboxGroup options={opt} />
        )}
      </FormItem>
    );
  };

  return (
    <Modal
      title={`${file.name[lang]} Promts`}
      visible={showModal}
      onOk={handleOk}
      onCancel={onHideModal}
      okText={i18n('form.ok')}
      cancelText={i18n('form.cancel')}
    >
      <Form style={{ marginTop: 20 }}>
        {
          file.promts.length && 
          file.promts.map(item => {
            let html;
            switch (item.type) {
              case 'input':
                html = inputTemp(item);
                break;
              case 'select':
                html = selectTemp(item);
                break;
              case 'checkbox':
                html = checkboxTemp(item);
                break;
              case 'switch':
                html = switchTemp(item);
                break;
              default:
                html = <div key={item.key} />;
                break;
            }
            return html;
          })
        }
      </Form>
    </Modal>
  );
};


PluginPromtsModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  onHideModal: PropTypes.func.isRequired,
  form: PropTypes.shape({
    getFieldDecorator: PropTypes.func,
    setFieldsValue: PropTypes.func,
    validateFields: PropTypes.func,
  }).isRequired,
  data: PropTypes.shape({
    file: PropTypes.object,
    name: PropTypes.string,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
  lang: PropTypes.string.isRequired,
  projPath: PropTypes.string.isRequired,
};

export default Form.create()(connect()(PluginPromtsModal));
