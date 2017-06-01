<<<<<<< HEAD
import React, { PropTypes, Component } from 'react';
import { remote } from 'electron';
import Button from 'antd/lib/button';
import Select from 'antd/lib/select';
import Radio from 'antd/lib/radio';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';
import { connect } from 'dva';

import i18n from 'i18n-renderer-nowa';
import { getLocalLanguage } from 'store-renderer-nowa';
import { VSCODE, SUBLIME, WEBSTORM } from 'const-renderer-nowa';
import { openUrl, hidePathString } from 'util-renderer-nowa';


const RadioGroup = Radio.Group;
const FormItem = Form.Item;
=======
import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import { shell, remote } from 'electron';
import Button from 'antd/lib/button';
import Message from 'antd/lib/message';
import Select from 'antd/lib/select';
import Radio from 'antd/lib/radio';
import Input from 'antd/lib/input';
import i18n from 'i18n';

import { hidePathString } from 'gui-util';
import { UPGRADE_URL, IS_WIN, VSCODE, SUBLIME, WEBSTORM } from 'gui-const';
import { 
  getLocalLanguage, setLocalLanguage,
  getLocalEditor, setLocalEditor, getLocalProjects,
  setLocalEditorPath } from 'gui-local';

const RadioGroup = Radio.Group;
// const InputGroup = Input.Group;
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
const DEFAULT_LANGUAGE = getLocalLanguage();


class SettingPage extends Component {
  constructor(props) {
    super(props);
<<<<<<< HEAD
    this.editor = props.editor;
    this.state = {
      shouldAppUpdate: props.version !== props.newVersion,
    };
=======
    this.state = {
      language: DEFAULT_LANGUAGE,
      defaultEditor: props.defaultEditor,
      editor: props.editor,
      shouldAppUpdate: props.version !== props.newVersion,
      registry: props.registry,
      // showModal: props.showModal
    };

    // this.hideModal = this.hideModal.bind(this);
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
  }

  componentWillReceiveProps(next) {
    const { newVersion } = this.props;
    if (next.newVersion !== newVersion) {
      this.setState({
        shouldAppUpdate: true
      });
    }
<<<<<<< HEAD
  }

  handleSubmit = () => {
    const that = this;
    const { dispatch, form } = that.props;
    form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        dispatch({
          type: 'setting/setValues',
          payload: {
            ...values,
            editor: that.editor,
          }
        });
      }
    });
  }

  selectPath() {
    const { form } = this.props;
    try {
      const importPath = remote.dialog.showOpenDialog({ properties: ['openFile'] });
      const defaultEditor = form.getFieldValue('defaultEditor');
      this.editor[defaultEditor] = importPath[0];

      form.setFieldsValue({
        editorPath: importPath[0]
      });
=======

    // if (next.showModal !== showModal) {
    //   this.setState({
    //     showModal: next.showModal
    //   });
    // }
  }

  goBack() {
    this.props.dispatch({ type: 'layout/goBack' });
  }

  handleSubmit() {
    const { backPage, dispatch } = this.props;
    const { language, defaultEditor, editor, registry } = this.state;

    console.log(registry);

    if (!editor[defaultEditor]) {
      Message.error(i18n('msg.editorPath'));
      return false;
    }

    dispatch({
      type: 'setting/changeStatus',
      payload: {
        defaultEditor,
        editor
      }
    });

    setLocalEditorPath(defaultEditor, editor[defaultEditor]);

    if (defaultEditor !== getLocalEditor()) {
      setLocalEditor(defaultEditor);
    }

    if (language !== DEFAULT_LANGUAGE) {
      setLocalLanguage(language);
      window.location.reload();
    }

    if (registry !== this.props.registry) {
      dispatch({
        type: 'setting/changeRegistry',
        payload: {
          registry
        }
      });
    }

    if (backPage !== -1) {
      this.goBack();
    } else {
      const proj = getLocalProjects();
      this.props.dispatch({
        type: 'layout/changeStatus',
        payload: {
          showPage: proj.length > 0 ? 2 : 0,
        }
      });
    }
  }

  selectPath() {
    const { defaultEditor, editor } = this.state;
    try {
      // const importPath = IS_WIN 
      //   ? remote.dialog.showOpenDialog({ properties: ['openDirectory'] })
      //   : remote.dialog.showOpenDialog({ properties: ['openFile'] });

      const importPath = remote.dialog.showOpenDialog({ properties: ['openFile'] });

      editor[defaultEditor] = importPath[0];
      
      this.setState({ editor });
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
    } catch (e) {
      console.log(e);
    }
  }

<<<<<<< HEAD
  goBack() {
    this.props.dispatch({ type: 'layout/goBack' });
  }


  // handleLanguageChange = (language) => {
  //   this.props.form.setFieldsValue({
  //     language,
  //   });
  // }
  // handleRegistryChange = (registry) => {
  //   console.log(registry);
  //   this.props.form.setFieldsValue({
  //     registry,
  //   });
  // }
  handleEditorChange = (e) => {
    const { form, editor } = this.props;
    const defaultEditor = e.target.value;
    form.setFieldsValue({
      defaultEditor,
    });
    form.setFieldsValue({
      editorPath: editor[defaultEditor]
    });
  }

  render() {
    const { shouldAppUpdate } = this.state;
    const { version, newVersion, upgradeUrl, registryList, registry, editor, defaultEditor } = this.props;
    const { getFieldDecorator } = this.props.form;
    const pathAddon = (<i className="iconfont icon-folder" onClick={() => this.selectPath()} />);

    return (
      <div className="setting">
        <h2 className="setting-title">{i18n('setting.modal.title')}</h2>
        <Form
          className="ui-form"
          layout="horizontal"
        >
          <FormItem
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 8 }}
            label={i18n('setting.version')}
          >
            <span className="setting-version">
=======
  render() {
    const { shouldAppUpdate, language, defaultEditor, editor, registry } = this.state;
    const { version, newVersion, upgradeUrl, registryList, backPage } = this.props;
    const upgrade = upgradeUrl || UPGRADE_URL;

    const pathAddon = (<i className="iconfont icon-folder" onClick={() => this.selectPath()} />);
    
    return (
      <div className="setting">
        <h2 className="setting-title">{i18n('setting.modal.title')}</h2>
        <form className="ui-form" >
          <div className="form-item">
            <label className="form-label">{i18n('setting.version')}:</label>
            <span className="version">
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
              {version}
              {!shouldAppUpdate && ` (${i18n('setting.version.newest.tip')})`}
            </span>
            {
              shouldAppUpdate &&
              <Button type="primary" size="small" icon="download"
<<<<<<< HEAD
                onClick={() => openUrl(upgradeUrl)}
              >{newVersion}</Button>
            }
          </FormItem>

          <FormItem
            label={i18n('setting.language')}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 8 }}
          >
          {getFieldDecorator('language', {
            initialValue: DEFAULT_LANGUAGE,
          })(
            <Select>
              <Select.Option value={'en'}>{i18n('setting.language.en')}</Select.Option>
              <Select.Option value={'zh'}>{i18n('setting.language.zh')}</Select.Option>
            </Select>
            )}
          </FormItem>

          <FormItem
            label={i18n('setting.registry')}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
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

          <FormItem
            label={i18n('setting.editor')}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
          >
            <FormItem>
              {getFieldDecorator('defaultEditor', {
                initialValue: defaultEditor,
                onChange: this.handleEditorChange,
              })(
              <RadioGroup>
                <Radio value={SUBLIME}>{SUBLIME}</Radio>
                <Radio value={VSCODE}>{VSCODE}</Radio>
                <Radio value={WEBSTORM}>{WEBSTORM}</Radio>
              </RadioGroup>
              )}
            </FormItem>
            <br/>
            <FormItem>
              {getFieldDecorator('editorPath', {
                initialValue: hidePathString(editor[defaultEditor], 42),
                rules: [
                  { required: true, message: i18n('msg.editorPath') },
                ],
              })(
              <Input
                addonAfter={pathAddon}
                disabled
              />
              )}
            </FormItem>
          </FormItem>
          <br/><br/>
          <FormItem wrapperCol={{ offset: 6 }} className="ui-form-btns">
            <Button type="primary" size="default" onClick={() => this.handleSubmit()}>{i18n('form.submit')}</Button>
            <Button type="default" size="default" onClick={() => this.goBack()}>{i18n('form.back')}</Button>
          </FormItem>
        </Form>
       
=======
                onClick={() => shell.openExternal(upgrade)}
              >{newVersion}</Button>
            }
          </div>
          <div className="form-item">
            <label className="form-label">{i18n('setting.editor')}:</label>
            <RadioGroup value={defaultEditor}
              onChange={e => this.setState({ defaultEditor: e.target.value })}
            >
              <Radio value={SUBLIME}>Sublime</Radio>
              <Radio value={VSCODE}>VScode</Radio>
              <Radio value={WEBSTORM}>WebStorm</Radio>
            </RadioGroup>
            <div className="form-item-grp">
              <Input addonAfter={pathAddon} disabled
                value={hidePathString(editor[defaultEditor], 42)}
              />
            </div>
          </div>

          <div className="form-item">
            <label className="form-label">{i18n('setting.registry')}:</label>
            <Select
              mode="combobox"
              style={{ width: 250 }}
              value={registry}
              filterOption={false}
              onChange={value => this.setState({ registry: value })}
            >
              {registryList.map(item => 
                <Select.Option value={item} key={item}>{item}</Select.Option>)}
            </Select>
          </div>
          
          <div className="form-item">
            <label className="form-label">{i18n('setting.language')}:</label>
            <Select
              style={{ width: 250 }}
              defaultValue={language}
              onChange={value => this.setState({ language: value })}
            >
              <Select.Option value={'en'}>{i18n('setting.language.en')}</Select.Option>
              <Select.Option value={'zh'}>{i18n('setting.language.zh')}</Select.Option>
            </Select>
          </div>

          <div className="form-btns">
            <Button type="primary" onClick={() => this.handleSubmit()}>{i18n('form.submit')}</Button>
            { backPage !== -1 && <Button type="default" onClick={() => this.goBack()}>{i18n('form.back')}</Button> }
          </div>
        </form>
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
      </div>
    );
  }
}

SettingPage.propTypes = {
<<<<<<< HEAD
=======
  // showModal: PropTypes.bool.isRequired,
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
  newVersion: PropTypes.string.isRequired,
  version: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  defaultEditor: PropTypes.string.isRequired,
  registry: PropTypes.string.isRequired,
  registryList: PropTypes.array.isRequired,
  upgradeUrl: PropTypes.string.isRequired,
<<<<<<< HEAD
  form: PropTypes.shape({
    getFieldDecorator: PropTypes.func,
    setFieldsValue: PropTypes.func,
    validateFields: PropTypes.func,
  }).isRequired,
=======
  backPage: PropTypes.number.isRequired,
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
  editor: PropTypes.shape({
    Sublime: PropTypes.string,
    VScode: PropTypes.string
  }).isRequired
};

<<<<<<< HEAD
export default Form.create()(connect(({ layout, setting }) => ({
  version: layout.version,
=======
export default connect(({ layout, setting }) => ({
  version: layout.version,
  shouldAppUpdate: layout.shouldAppUpdate,
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
  newVersion: layout.newVersion,
  upgradeUrl: layout.upgradeUrl,
  defaultEditor: setting.defaultEditor,
  editor: setting.editor,
  registry: setting.registry,
  registryList: setting.registryList,
<<<<<<< HEAD
}))(SettingPage));

=======
  backPage: layout.backPage,
}))(SettingPage);
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
