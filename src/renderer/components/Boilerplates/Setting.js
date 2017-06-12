import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import { join } from 'path';
import { remote } from 'electron';
import { homedir } from 'os';
import Button from 'antd/lib/button';
import Form from 'antd/lib/form';
import Select from 'antd/lib/select';
import Input from 'antd/lib/input';
import Checkbox from 'antd/lib/checkbox';

import i18n from 'i18n-renderer-nowa';
import { NAME_MATCH } from 'const-renderer-nowa';
import OverwriteModal from './OverwriteModal';

const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
const formItemLayout = {
  labelCol: { span: 4, offset: 3 },
  wrapperCol: { span: 12 }
};

class Setting extends Component {

  constructor(props) {
    super(props);
    const { selectExtendsProj } = props;

    this.basePath = join(homedir(), 'NowaProject');

    this.baseExtraArgs = {};

    this.state = {
      description: 'An awesome project',
      author: process.env.USER || process.env.USERNAME || '',
      version: '1.0.0',
      homepage: '',
      repository: '',
    };
    this.hasPrompts = Object.keys(selectExtendsProj).length && selectExtendsProj.prompts;

    if (this.hasPrompts) {
      selectExtendsProj.prompts.forEach((item) => {
        this.baseExtraArgs[item.name] = item.default || false;
      });
    }

    this.getExtendsHtml = this.getExtendsHtml.bind(this);
    this.goBack = this.goBack.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
  }

  getExtendsHtml() {
    const { selectExtendsProj, form } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const filterConfirm = selectExtendsProj.prompts.filter(item => item.type === 'confirm');
    const filterInput = selectExtendsProj.prompts.filter(item => item.type === 'input');
    const html = [];

    if (filterConfirm.length) {
      const options = filterConfirm.map((item) => {
        const label = item.message;
        const value = item.name;
        return { label, value };
      });
      html.push(
        <FormItem
          label={i18n('project.meta.others')}
          {...formItemLayout}
          key="confirm"
        >
        {getFieldDecorator('extraArgs', {
          onChange: this.changeExtraArgs
        })(
          <CheckboxGroup options={options} />
        )}
        </FormItem>
      );
    }

    if (filterInput.length) {
      filterInput.forEach((item) => {
        if (item.typeLink) {
          const linkValue = getFieldValue(item.typeLink.key);
          const initialValue = item.typeLink.onChange(linkValue || 'untitled');
          html.push(
            <FormItem
              label={item.message}
              {...formItemLayout}
              key={item.name}
            >{getFieldDecorator(item.name, {
              initialValue
            })(<Input />)}</FormItem>
          );
        } else {
          html.push(
            <FormItem
              label={item.message}
              {...formItemLayout}
              key={item.name}
            >{getFieldDecorator(item.name, {
            })(<Input />)}</FormItem>
          );
        }
      });
    }

    return html;
  }

  goBack() {
    const { dispatch } = this.props;
    dispatch({
      type: 'projectCreate/changeStatus',
      payload: { processStep: 0 }
    });
    dispatch({
      type: 'layout/changeStatus',
      payload: { showSideMask: false }
    });
  }

  selectPath() {
    try {
      const { form } = this.props;
      const importPath = remote.dialog.showOpenDialog({ properties: ['openDirectory'] });
      // const projName = basename(form.getFieldValue('projPath'));
      // const projPath = join(importPath[0], projName);
      /*
      const input = document.getElementById('pathInput');
      input.focus();
      input.selectionStart = input.value.length;
      input.selectionEnd = input.value.length;
      */
      this.basePath = importPath[0];
      const name = form.getFieldValue('name');
      form.setFieldsValue({
        projPath: join(importPath[0], name),
      });
    } catch (err) {
      console.log(err);
    }
  }

  handleNameChange(e) {
    const { form } = this.props;
    const name = e.target.value;
    // console.log(this.baseExtraArgs);

    form.setFieldsValue({
      name,
      projPath: join(this.basePath, name)
    });
  }

  handleSubmit() {
    const that = this;
    const { dispatch, form } = that.props;
    // form.validateFields((err, { extraArgs, name, projPath, registry }) => {
    form.validateFields((err, { extraArgs, ...others }) => {
      if (!err) {
        const obj = {};
        if (extraArgs) {
          extraArgs.forEach((arg) => {
            obj[arg] = true;
          });
        }
        const args = {
          ...this.state,
          ...this.baseExtraArgs,
          ...obj,
          ...others,
        };
        console.log(args);
        dispatch({
          type: 'projectCreate/checkSetting',
          payload: args
        });
      }
    });
  }


  render() {
    const { registryList, defaultRegistry } = this.props;
    const { getFieldDecorator } = this.props.form;
    let extendsHtml;

    if (this.hasPrompts) {
      extendsHtml = this.getExtendsHtml();
    }

    const pathIcon = (<i className="iconfont icon-folder" onClick={() => this.selectPath()} />);

    return (
      <div className="boilerplate-form">
        <Form
          layout="horizontal"
        >
          <FormItem
            label={i18n('project.meta.name')}
            {...formItemLayout}
            required
          >
            {getFieldDecorator('name', {
              initialValue: 'untitled',
              rules: [
                { message: i18n('msg.invalidName'), pattern: NAME_MATCH, required: true },
              ],
              onChange: this.handleNameChange
            })(<Input />)}
          </FormItem>
          <FormItem
            label={i18n('project.meta.path')}
            {...formItemLayout}
          >
            {getFieldDecorator('projPath', {
              initialValue: this.basePath,
              rules: [
                { required: true, message: i18n('msg.required') },
              ],
            })(
              <Input
                disabled
                id="pathInput"
                addonAfter={pathIcon}
              />
            )}
          </FormItem>
          <FormItem
            label={i18n('project.meta.npm_registry')}
            {...formItemLayout}
          >
            {getFieldDecorator('registry', {
              initialValue: defaultRegistry,
              rules: [{ type: 'url' }],
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
          { extendsHtml }
          <FormItem wrapperCol={{ offset: 7 }} className="ui-form-btns">
            <Button type="primary" size="default" onClick={() => this.handleSubmit()}>{i18n('form.submit')}</Button>
            <Button type="default" size="default" onClick={() => this.goBack()}>{i18n('form.back')}</Button>
          </FormItem>
        </Form>
        <OverwriteModal />
      </div>
    );
  }
}


Setting.propTypes = {
  selectExtendsProj: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  defaultRegistry: PropTypes.string.isRequired,
  registryList: PropTypes.array.isRequired,
  form: PropTypes.shape({
    getFieldDecorator: PropTypes.func,
    setFieldsValue: PropTypes.func,
    validateFields: PropTypes.func,
  }).isRequired,
};

export default Form.create()(connect(({ setting, projectCreate }) => ({
  selectExtendsProj: projectCreate.selectExtendsProj,
  // showModal: projectCreate.showOverwriteModal,
  defaultRegistry: setting.registry,
  registryList: setting.registryList,
}))(Setting));
