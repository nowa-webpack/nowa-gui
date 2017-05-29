import React, { Component, PropTypes } from 'react';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';

import i18n from 'i18n-renderer-nowa';
import { NAME_MATCH } from 'const-renderer-nowa';

const FormItem = Form.Item;

class RemoteForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      changed: false,
    };
    this.changeName = this.changeName.bind(this);
    this.changeDescription = this.changeDescription.bind(this);
    this.changeUrl = this.changeUrl.bind(this);
    this.sendData = this.sendData.bind(this);
  }

  componentWillReceiveProps(next) {
    if (next.data !== this.props.data) {
      next.form.setFieldsValue({
        remote: next.data.remote,
        name: next.data.name,
        description: next.data.description,
      });
    }
  }

  changeUrl(e) {
    const { form } = this.props;
    form.setFieldsValue({
      remote: e.target.value
    });
    this.sendData();
  }

  changeName(e) {
    const { form } = this.props;
    form.setFieldsValue({
      name: e.target.value
    });
    this.sendData();
  }

  changeDescription(e) {
    const { form } = this.props;
    form.setFieldsValue({
      description: e.target.value
    });
    this.sendData();
  }

  sendData() {
    const { form, onChangeData } = this.props;
    form.validateFields((err, data) => {
      if (!err) {
        onChangeData(data);
      }
    });
  }


  render() {
    const { getFieldDecorator } = this.props.form;
    const { name, description, remote } = this.props.data;

    return (
      <Form
        className="ui-form"
        layout="horizontal"
        style={{ marginTop: 20 }}
      >
        <FormItem
          label={i18n('template.modal.name')}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 16 }}
        >
          {getFieldDecorator('name', {
            initialValue: name,
            onChange: this.changeName,
            rules: [
              { required: true, message: i18n('msg.required') },
              { pattern: NAME_MATCH, message: i18n('msg.invalidName') },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem
          label={i18n('template.modal.description')}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 16 }}
        >
          {getFieldDecorator('description', {
            initialValue: description,
            onChange: this.changeDescription
          })(<Input />)}
        </FormItem>
        <FormItem
          label={i18n('template.modal.remote.path')}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 16 }}
        >
          {getFieldDecorator('remote', {
            initialValue: remote,
            rules: [
              { required: true, message: i18n('msg.required'), type: 'url' },
            ],
          })(<Input />)}
        </FormItem>
      </Form>
    );
  }
}

RemoteForm.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string,
    remote: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  onChangeData: PropTypes.func.isRequired,
  form: PropTypes.shape({
    getFieldDecorator: PropTypes.func,
    setFieldsValue: PropTypes.func,
    validateFields: PropTypes.func,
  }).isRequired,
};

export default Form.create()(RemoteForm);

