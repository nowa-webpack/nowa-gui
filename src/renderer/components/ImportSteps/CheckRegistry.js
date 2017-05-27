import React, { PropTypes } from 'react';
import { Content } from 'antd/lib/layout';
import Button from 'antd/lib/button';
import Select from 'antd/lib/select';
import Form from 'antd/lib/form';
import Col from 'antd/lib/col';
import { connect } from 'dva';
import i18n from 'i18n-renderer-nowa';

const FormItem = Form.Item;

const CheckRegistry = ({
  dispatch,
  defaultRegistry,
  registryList,
  form: {
    getFieldDecorator,
    validateFields,
    getFieldsValue,
  },
}) => {
  const handleSubmit = () => {
    validateFields((errors) => {
      if (errors) {
        return;
      }
      const data = { ...getFieldsValue() };
      dispatch({
        type: 'projectCreate/checkRegistry',
        payload: data
      });
    });
  };

  return (
    <Content className="importing">
      <h2 className="importing-title">{i18n('project.import.title')}</h2>
      <Form
        className="ui-form"
        layout="horizontal"
      >
        <Col offset={6} span={16} style={{ marginBottom: 20 }}>
          <p className="importing-detail-err">{i18n('project.import.info')}</p>
        </Col>
        <FormItem
          label={i18n('project.meta.npm_registry')}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
        >
          {getFieldDecorator('registry', {
            initialValue: defaultRegistry,
            onChange: this.handleRegistryChange,
          })(
            <Select
              mode="combobox"
              filterOption={false}
            >
              {registryList.map(item =>
                <Select.Option value={item} key={item}>{item}</Select.Option>)}
            </Select>
          )}
        </FormItem>
        <FormItem wrapperCol={{ offset: 6 }} className="ui-form-btns">
          <Button type="primary" onClick={handleSubmit}>{i18n('project.import.install')}</Button>
        </FormItem>
      </Form>
    </Content>
  );
};


CheckRegistry.propTypes = {
  registryList: PropTypes.array.isRequired,
  defaultRegistry: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  form: PropTypes.shape({
    getFieldDecorator: PropTypes.func,
    setFieldsValue: PropTypes.func,
    validateFields: PropTypes.func,
  }).isRequired,
};

export default Form.create()(connect(({ setting }) => ({
  defaultRegistry: setting.registry,
  registryList: setting.registryList,
}))(CheckRegistry));
