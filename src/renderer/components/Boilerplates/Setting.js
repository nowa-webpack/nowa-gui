import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import { join, basename } from 'path';
import { remote } from 'electron';
import { homedir } from 'os';
import Button from 'antd/lib/button';
import Form from 'antd/lib/form';
import Select from 'antd/lib/select';
import Input from 'antd/lib/input';
import Checkbox from 'antd/lib/checkbox';

import i18n from 'i18n-renderer-nowa';
import { hidePathString, msgError } from 'util-renderer-nowa';
import { NAME_MATCH } from 'const-renderer-nowa';
import OverwriteModal from './OverwriteModal';

const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;

class Setting extends Component {

  constructor(props) {
    super(props);
    const { selectExtendsProj } = props;

    const name = 'untitled';
    // const name = '';

    this.baseExtraArgs = {};

    if (Object.keys(selectExtendsProj).length) {
      selectExtendsProj.prompts.forEach((item) => {
        this.baseExtraArgs[item.name] = item.default || false;
      });
    }
    this.basePath = join(homedir(), 'NowaProject2', name);

    this.state = {
      description: 'An awesome project',
      author: process.env.USER || process.env.USERNAME || '',
      version: '1.0.0',
      homepage: '',
      repository: '',
    };

    this.getExtendsHtml = this.getExtendsHtml.bind(this);
    this.goBack = this.goBack.bind(this);
  }

  selectPath() {
    try {
      const { form } = this.props;
      const importPath = remote.dialog.showOpenDialog({ properties: ['openDirectory'] });
      const projName = basename(form.getFieldValue('projPath'));
      const projPath = join(importPath[0], projName);
      // const input = document.getElementById('pathInput');
      // input.focus();
      // input.selectionStart = input.value.length;
      // input.selectionEnd = input.value.length;
      form.setFieldsValue({
        projPath
      });
    } catch (err) {
      console.log(err);
    }
  }

  goBack() {
    this.props.dispatch({
      type: 'projectCreate/changeStatus',
      payload: { processStep: 0 }
    });
    this.props.dispatch({
      type: 'layout/changeStatus',
      payload: { showSideMask: false }
    });
  }

  handleSubmit() {
    const that = this;
    const { dispatch, form } = that.props;
    form.validateFields((err, { extraArgs, projPath, registry }) => {
      if (!err) {
        // console.log('Received values of form: ', values);
        const name = basename(projPath);
        const obj = {};
        if (extraArgs) {
          extraArgs.forEach((name) => obj[name] = true);
        }
        const args = {
          projPath,
          registry,
          name,
          ...this.state,
          ...this.baseExtraArgs,
          ...obj,
        };
        console.log(args);
        dispatch({
          type: 'projectCreate/checkSetting',
          payload: args
        });
      }

    });
  }

  getExtendsHtml() {
    const { selectExtendsProj, form } = this.props;
    const { getFieldDecorator } = form;
    const options = selectExtendsProj.prompts.map((item) => {
      const label = item.message;
      const value = item.name;
      return { label, value };
    });

    return (
      <FormItem
        label={i18n('project.meta.others')}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
      >
      {getFieldDecorator('extraArgs', {
        onChange: this.changeExtraArgs
      })(
        <CheckboxGroup options={options} />
      )}
      </FormItem>
    );
  }

  render() {
    const { selectExtendsProj, registryList, defaultRegistry } = this.props;
    const { getFieldDecorator } = this.props.form;
    let extendsHtml;

    if (Object.keys(selectExtendsProj).length) {
      extendsHtml = this.getExtendsHtml();
    }

    const pathIcon = (<i className="iconfont icon-folder" onClick={() => this.selectPath()} />);

    return (
      <div className="boilerplate-form">
        <Form
          className="ui-form"
          layout="horizontal"
        >
          <FormItem
            label={i18n('project.meta.path')}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
          >
            {getFieldDecorator('projPath', {
              initialValue: this.basePath,
              rules: [
                { required: true, message: i18n('msg.required') },
              ],
            })(
              <Input
                id="pathInput"
                addonAfter={pathIcon}
                onPressEnter={() => this.handleSubmit()}
              />
            )}
          </FormItem>
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
          { extendsHtml }
          <FormItem wrapperCol={{ offset: 6 }} className="ui-form-btns">
            <Button type="primary" onClick={() => this.handleSubmit()}>{i18n('form.submit')}</Button>
            <Button type="default" onClick={() => this.goBack()}>{i18n('form.back')}</Button>
          </FormItem>
        </Form>
        <OverwriteModal />
      </div>
    );
  }
}

/*<Input
  id="pathInput"
  value={showPath}
  addonAfter={pathIcon}
  onFocus={() => this.setState({ showPath: projPath })}
  onBlur={() => this.setState({ showPath: hidePathString(projPath, 45) })}
  onPressEnter={() => this.handleSubmit()}
  onChange={e => this.setState({
    projPath: e.target.value,
    showPath: e.target.value
  })}
/>*/

Setting.propTypes = {
  selectExtendsProj: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
  defaultRegistry: PropTypes.string.isRequired,
  registryList: PropTypes.array.isRequired,
  form: PropTypes.object,
};


export default Form.create()(connect(({ setting, projectCreate }) => ({
  selectExtendsProj: projectCreate.selectExtendsProj,
  // showModal: projectCreate.showOverwriteModal,
  defaultRegistry: setting.registry,
  registryList: setting.registryList,
}))(Setting));
