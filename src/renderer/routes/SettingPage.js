import React, { PropTypes, Component } from 'react';
import { remote } from 'electron';
import Button from 'antd/lib/button';
// import Message from 'antd/lib/message';
import Select from 'antd/lib/select';
import Radio from 'antd/lib/radio';
import Input from 'antd/lib/input';
import { connect } from 'dva';

import i18n from 'i18n-renderer-nowa';
import {
  getLocalLanguage, setLocalLanguage,
  getLocalEditor, setLocalEditor, setLocalEditorPath,
} from 'store-renderer-nowa';
import { VSCODE, SUBLIME, WEBSTORM } from 'const-renderer-nowa';
import { openUrl, hidePathString, msgError, msgSuccess } from 'util-renderer-nowa';


const RadioGroup = Radio.Group;
const DEFAULT_LANGUAGE = getLocalLanguage();

class SettingPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      language: DEFAULT_LANGUAGE,
      defaultEditor: props.defaultEditor,
      editor: props.editor,
      shouldAppUpdate: props.version !== props.newVersion,
      registry: props.registry,
    };
  }

  componentWillReceiveProps(next) {
    const { newVersion } = this.props;
    if (next.newVersion !== newVersion) {
      this.setState({
        shouldAppUpdate: true
      });
    }
  }

  handleSubmit() {
    const { dispatch } = this.props;
    const { language, defaultEditor, editor, registry } = this.state;

    console.log(language, defaultEditor, editor, registry);

    if (!editor[defaultEditor]) {
      msgError(i18n('msg.editorPath'));
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

    if (registry !== this.props.registry) {
      dispatch({
        type: 'setting/changeRegistry',
        payload: {
          registry
        }
      });
    }

    if (language !== DEFAULT_LANGUAGE) {
      setLocalLanguage(language);
      window.location.reload();
    } else {
      msgSuccess(i18n('msg.updateSuccess'));
    }

    this.goBack();
  }

  selectPath() {
    const { defaultEditor, editor } = this.state;
    try {
      const importPath = remote.dialog.showOpenDialog({ properties: ['openFile'] });

      editor[defaultEditor] = importPath[0];
      
      this.setState({ editor });
    } catch (e) {
      console.log(e);
    }
  }

  goBack() {
    this.props.dispatch({ type: 'layout/goBack' });
  }

  render() {
    const { shouldAppUpdate, language, defaultEditor, editor, registry } = this.state;
    const { version, newVersion, upgradeUrl, registryList } = this.props;

    const pathAddon = (<i className="iconfont icon-folder" onClick={() => this.selectPath()} />);
    
    return (
      <div className="setting">
        <h2 className="setting-title">{i18n('setting.modal.title')}</h2>
        <form className="ui-form" >
          <div className="ui-form-item">
            <label className="ui-form-label">{i18n('setting.version')}:</label>
            <span className="setting-version">
              {version}
              {!shouldAppUpdate && ` (${i18n('setting.version.newest.tip')})`}
            </span>
            {
              shouldAppUpdate &&
              <Button type="primary" size="small" icon="download"
                onClick={() => openUrl(upgradeUrl)}
              >{newVersion}</Button>
            }
          </div>

          <div className="ui-form-item">
            <label className="ui-form-label">{i18n('setting.language')}:</label>
            <Select
              style={{ width: 95 }}
              defaultValue={language}
              onChange={value => this.setState({ language: value })}
            >
              <Select.Option value={'en'}>{i18n('setting.language.en')}</Select.Option>
              <Select.Option value={'zh'}>{i18n('setting.language.zh')}</Select.Option>
            </Select>
          </div>

          <div className="ui-form-item">
            <label className="ui-form-label">{i18n('setting.editor')}:</label>
            <RadioGroup value={defaultEditor}
              onChange={e => this.setState({ defaultEditor: e.target.value })}
            >
              <Radio value={SUBLIME}>{SUBLIME}</Radio>
              <Radio value={VSCODE}>{VSCODE}</Radio>
              <Radio value={WEBSTORM}>{WEBSTORM}</Radio>
            </RadioGroup>
            <div className="ui-form-item-grp">
              <Input addonAfter={pathAddon} disabled
                value={hidePathString(editor[defaultEditor], 42)}
              />
            </div>
          </div>

          <div className="ui-form-item">
            <label className="ui-form-label">{i18n('setting.registry')}:</label>
            <Select
              mode="combobox"
              style={{ width: 300 }}
              value={registry}
              filterOption={false}
              onChange={value => this.setState({ registry: value })}
            >
              {registryList.map(item => 
                <Select.Option value={item} key={item}>{item}</Select.Option>)}
            </Select>
          </div>

          <div className="ui-form-btns">
            <Button type="primary" onClick={() => this.handleSubmit()}>{i18n('form.submit')}</Button>
            <Button type="default" onClick={() => this.goBack()}>{i18n('form.back')}</Button>
          </div>
        </form>
      </div>
    );
  }
}

SettingPage.propTypes = {
  newVersion: PropTypes.string.isRequired,
  version: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  defaultEditor: PropTypes.string.isRequired,
  registry: PropTypes.string.isRequired,
  registryList: PropTypes.array.isRequired,
  upgradeUrl: PropTypes.string.isRequired,
  editor: PropTypes.shape({
    Sublime: PropTypes.string,
    VScode: PropTypes.string
  }).isRequired
};

export default connect(({ layout, setting }) => ({
  version: layout.version,
  newVersion: layout.newVersion,
  upgradeUrl: layout.upgradeUrl,
  defaultEditor: setting.defaultEditor,
  editor: setting.editor,
  registry: setting.registry,
  registryList: setting.registryList,
}))(SettingPage);

