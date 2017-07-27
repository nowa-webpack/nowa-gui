/*
  模板表单页面
  选择模板后进入此表单页
*/
import React, { Component, PropTypes } from 'react';
import { remote } from 'electron';
import { connect } from 'dva';
import { homedir } from 'os';
import { join } from 'path';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Button from 'antd/lib/button';
import Select from 'antd/lib/select';
import Checkbox from 'antd/lib/checkbox';

import i18n from 'i18n-renderer-nowa';
import { NAME_MATCH, REGISTRY_MAP } from 'const-renderer-nowa';
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

    // 默认回答
    this.state = {
      description: 'An awesome project',
      author: process.env.USER || process.env.USERNAME || '',
      version: '1.0.0',
      homepage: '',
      repository: '',
    };
    // 模板的额外提问
    this.hasPrompts = Object.keys(selectExtendsProj).length && selectExtendsProj.prompts;
    // 模板的额外提问的验证器
    this.extendsValidator = selectExtendsProj.validator || {};

    if (this.hasPrompts) {
      selectExtendsProj.prompts.forEach((item) => {
        this.baseExtraArgs[item.name] = item.default || false;
      });
    }

    this.goBack = this.goBack.bind(this);
    this.nameValid = this.nameValid.bind(this);
    this.getExtendsHtml = this.getExtendsHtml.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
  }

  // 通过额外提问格式渲染出表单域
  // 表单格式主要为 input 和 confirm 两种，分别渲染为 checkbox 和 input
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
        // typeLink 代表这个表单需要与其他表单项联动，联动表单域名
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

    form.setFieldsValue({
      name,
      projPath: join(this.basePath, name)
    });
  }

  nameValid(rule, value, callback) {
    if (!(NAME_MATCH.test(value))) {
      callback(i18n('msg.invalidName'));
    }
    const { err, msg } = this.extendsValidator.name(value);
    if (err) {
      callback(msg);
    }
    callback();
  }

  handleSubmit() {
    const that = this;
    const { dispatch, form } = that.props;
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
    const { registryList, defaultRegistry, selectExtendsProj, selectBoilerplateType } = this.props;
    const { getFieldDecorator } = this.props.form;
    let extendsHtml;
    const nameRules = [
      { message: i18n('msg.invalidName'), pattern: NAME_MATCH, required: true },
    ];

    if (this.hasPrompts) {
      extendsHtml = this.getExtendsHtml();
    }

    const pathIcon = (<i className="iconfont icon-folder" onClick={() => this.selectPath()} />);
    if (this.extendsValidator.name) {
      nameRules.push({ validator: this.nameValid });
    }

    const registry = selectBoilerplateType !== 'ali' ? defaultRegistry : REGISTRY_MAP.tnpm;

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
              rules: nameRules,
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
              initialValue: registry,
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
  selectBoilerplateType: PropTypes.string.isRequired,
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
  selectExtendsProj: projectCreate.selectExtendsProj || {},
  selectBoilerplateType: projectCreate.selectBoilerplateType || 'official',
  defaultRegistry: setting.registry,
  registryList: setting.registryList,
}))(Setting));
