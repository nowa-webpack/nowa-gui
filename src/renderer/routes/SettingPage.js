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
import { UPGRADE_URL, IS_WIN, VSCODE, SUBLIME } from 'gui-const';
import { 
  getLocalLanguage, setLocalLanguage,
  getLocalEditor, setLocalEditor, getLocalProjects,
  setLocalEditorPath } from 'gui-local';

const RadioGroup = Radio.Group;
const InputGroup = Input.Group;
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
      // showModal: props.showModal
    };

    // this.hideModal = this.hideModal.bind(this);
  }

  componentWillReceiveProps(next) {
    const { newVersion } = this.props;
    if (next.newVersion !== newVersion) {
      this.setState({
        shouldAppUpdate: true
      });
    }

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
      const importPath = IS_WIN 
        ? remote.dialog.showOpenDialog({ properties: ['openDirectory'] })
        : remote.dialog.showOpenDialog({ properties: ['openFile'] });

      editor[defaultEditor] = importPath[0];

      
      this.setState({ editor });
    } catch (e) {
      console.log(e);
    }
  }

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
              {version}
              {!shouldAppUpdate && ` (${i18n('setting.version.newest.tip')})`}
            </span>
            {
              shouldAppUpdate &&
              <Button type="primary" size="small" icon="download"
                onClick={() => shell.openExternal(upgrade)}
              >{newVersion}</Button>
            }
          </div>
          <div className="form-item">
            <label className="form-label">{i18n('setting.editor')}:</label>
            <RadioGroup value={defaultEditor}
              onChange={(e) => this.setState({ defaultEditor: e.target.value })}
            >
              <Radio value={SUBLIME}>Sublime3</Radio>
              <Radio value={VSCODE}>VScode</Radio>
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
      </div>
    );
  }
}

SettingPage.propTypes = {
  // showModal: PropTypes.bool.isRequired,
  newVersion: PropTypes.string.isRequired,
  version: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  defaultEditor: PropTypes.string.isRequired,
  registry: PropTypes.string.isRequired,
  registryList: PropTypes.array.isRequired,
  upgradeUrl: PropTypes.string.isRequired,
  backPage: PropTypes.number.isRequired,
  editor: PropTypes.shape({
    Sublime: PropTypes.string,
    VScode: PropTypes.string
  }).isRequired
};

export default connect(({ layout, setting }) => ({
  // showModal: layout.showSetModal,
  version: layout.version,
  shouldAppUpdate: layout.shouldAppUpdate,
  newVersion: layout.newVersion,
  upgradeUrl: layout.upgradeUrl,
  defaultEditor: setting.defaultEditor,
  editor: setting.editor,
  registry: setting.registry,
  registryList: setting.registryList,
  backPage: layout.backPage,
}))(SettingPage);
