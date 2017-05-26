import React, { Component, PropTypes } from 'react';
import { remote } from 'electron';
import { basename } from 'path';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';
import { connect } from 'dva';


import i18n from 'i18n-renderer-nowa';
import { hidePathString } from 'util-renderer-nowa';
import { NAME_MATCH } from 'const-renderer-nowa';

const FormItem = Form.Item;

/*const LocalForm = ({
  data,
  form: {
    getFieldDecorator,
    setFieldsValue,
    validateFields,
  },
  dispatch,
  saveFlag,
}) => {

  const { name, description, path } = data;
  
  const selectPath = () => {
    try {
      const importPath = remote.dialog.showOpenDialog({ properties: ['openDirectory'] });

      setFieldsValue({
        path: importPath[0],
        name: basename(importPath[0])
      });
    } catch (e) {
      console.log(e);
    }
  };

  const pathAddon = (<i className="iconfont icon-folder" onClick={selectPath} />);


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
        })(<Input />)}
      </FormItem>
      <FormItem
        label={i18n('template.modal.local.path')}
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 16 }}
      >
        {getFieldDecorator('path', {
          initialValue: hidePathString(path, 52),
          rules: [
            { required: true, message: i18n('msg.required') },
          ],
        })(<Input addonAfter={pathAddon} disabled />)}
      </FormItem>
    </Form>
  );
};*/

class LocalForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      changed: false,
    };
    this.changeName = this.changeName.bind(this);
    this.changeDescription = this.changeDescription.bind(this);
    this.sendData = this.sendData.bind(this);
  }

  componentWillReceiveProps(next) {
    if (next.data !== this.props.data) {
      next.form.setFieldsValue({
        path: next.data.path,
        name: next.data.name,
        description: next.data.description,
      });
    }
  }

  selectPath() {
    const { form } = this.props;
    try {
      const importPath = remote.dialog.showOpenDialog({ properties: ['openDirectory'] });

      form.setFieldsValue({
        path: importPath[0],
        name: basename(importPath[0])
      });
      this.sendData();
    } catch (e) {
      console.log(e);
    }
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
    const { name, description, path } = this.props.data;

    const pathAddon = (<i className="iconfont icon-folder" onClick={() => this.selectPath()} />);

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
          label={i18n('template.modal.local.path')}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 16 }}
        >
          {getFieldDecorator('path', {
            initialValue: path,
            rules: [
              { required: true, message: i18n('msg.required') },
            ],
          })(<Input addonAfter={pathAddon} disabled />)}
        </FormItem>
      </Form>
    );
  }
}

LocalForm.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string,
    path: PropTypes.string,
    // remote: PropTypes.string,
    description: PropTypes.string,
    // type: PropTypes.string,
  }).isRequired,
  // dispatch: PropTypes.func.isRequired,
  onChangeData: PropTypes.func.isRequired,
  form: PropTypes.shape({
    getFieldDecorator: PropTypes.func,
    setFieldsValue: PropTypes.func,
    validateFields: PropTypes.func,
  }).isRequired,
  // saveFlag: PropTypes.bool.isRequired,
};

export default Form.create()(LocalForm);

// export default Form.create()(connect(({ boilerplate }) => ({
//   data: boilerplate.editLocalBoilplateData,
// }))(LocalForm));
