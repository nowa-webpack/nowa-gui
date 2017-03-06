import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import { shell, remote } from 'electron';
import Button from 'antd/lib/button';
import Message from 'antd/lib/message';
import Modal from 'antd/lib/modal';
import Select from 'antd/lib/select';
import Radio from 'antd/lib/radio';
import Input from 'antd/lib/input';
import i18n from 'i18n';

import { hidePathString } from '../../util';
import { UPGRADE_URL, IS_WIN } from '../../constants';
import { 
  getLocalLanguage, setLocalLanguage,
  getLocalEditor, setLocalEditor,
  setLocalSublimePath, setLocalVScodePath } from '../../services/localStorage';

const RadioGroup = Radio.Group;
const DEFAULT_LANGUAGE = getLocalLanguage();


class SetDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      language: DEFAULT_LANGUAGE,
      defaultEditor: props.defaultEditor,
      editor: props.editor,
      shouldAppUpdate: props.version !== props.newVersion,
      showModal: props.showModal
    };

    this.hideModal = this.hideModal.bind(this);
  }

  componentWillReceiveProps(next) {
    const { showModal, newVersion } = this.props;
    if (next.newVersion !== newVersion) {
      this.setState({
        shouldAppUpdate: true
      });
    }

    if (next.showModal !== showModal) {
      this.setState({
        showModal: next.showModal
      });
    }
  }

  hideModal() {
    this.props.dispatch({ type: 'layout/changeStatus', payload: { showSetModal: false } });
  }

  handleOk() {
    const { language, defaultEditor, editor } = this.state;

    if (!editor[defaultEditor]) {
      Message.error(i18n('msg.editorPath'));
      return false;
    }

    this.props.dispatch({
      type: 'layout/changeStatus',
      payload: {
        defaultEditor,
        editor
      }
    });

    if (language !== DEFAULT_LANGUAGE) {
      setLocalLanguage(language);
      window.location.reload();
    }

    if (defaultEditor !== getLocalEditor()) {
      setLocalEditor(defaultEditor);
    }

    this.hideModal();
  }

  selectPath() {
    const { defaultEditor, editor } = this.state;
    try {
      const importPath = IS_WIN 
        ? remote.dialog.showOpenDialog({ properties: ['openDirectory'] })
        : remote.dialog.showOpenDialog({ properties: ['openFile'] });
      editor[defaultEditor] = importPath[0];

      if (defaultEditor === 'Sublime') {
        setLocalSublimePath(importPath[0]);
      }

      if (defaultEditor === 'VScode') {
        setLocalVScodePath(importPath[0]);
      }
      
      this.setState({ editor });
    } catch (e) {
      console.log(e);
    }
  }

  render() {
    const { shouldAppUpdate, language, showModal, defaultEditor, editor } = this.state;
    const { version, newVersion } = this.props;

    const pathIcon = <i className="iconfont icon-folder" onClick={() => this.selectPath()} />;

    return (
      <Modal
        title={i18n('setting.modal.title')}
        visible={showModal}
        onOk={() => this.handleOk()} 
        onCancel={() => this.hideModal()}
        wrapClassName="set-modal"
        okText={i18n('form.ok')}
        cancelText={i18n('form.cancel')}
      >
        <form className="ui-form" >
          <div className="form-item">
            <label className="form-label">{i18n('setting.language')}:</label>
            <Select
              style={{ width: 250 }}
              defaultValue={language}
              onChange={(language) => this.setState({ language })}
            >
              <Select.Option value={'en'}>{i18n('setting.language.en')}</Select.Option>
              <Select.Option value={'zh'}>{i18n('setting.language.zh')}</Select.Option>
            </Select>
          </div>

          <div className="form-item">
            <label className="form-label">{i18n('setting.version')}:</label>
            <span className="version">
              {version}
              {!shouldAppUpdate && ` (${i18n('setting.version.newest.tip')})`}
            </span>
            {
              shouldAppUpdate &&
              <Button type="primary" size="small" icon="download"
                onClick={() => shell.openExternal(UPGRADE_URL)} 
              >{newVersion}</Button>
            }
          </div>
          <div className="form-item">
            <label className="form-label">{i18n('setting.editor')}:</label>
            <RadioGroup value={defaultEditor}
              onChange={(e) => this.setState({ defaultEditor: e.target.value })}
            >
              <Radio value="Sublime">Sublime</Radio>
              <Radio value="VScode">VScode</Radio>
            </RadioGroup>
            <div className="form-item-grp">
              <Input addonAfter={pathIcon} disabled
                value={hidePathString(editor[defaultEditor], 42)}
              />
            </div>
          </div>
        </form>
      </Modal>
    );
  }
}

SetDialog.propTypes = {
  showModal: PropTypes.bool.isRequired,
  newVersion: PropTypes.string.isRequired,
  version: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  defaultEditor: PropTypes.string.isRequired,
  editor: PropTypes.shape({
    Sublime: PropTypes.string,
    VScode: PropTypes.string
  }).isRequired
};

export default connect(({ layout }) => ({
  showModal: layout.showSetModal,
  version: layout.version,
  shouldAppUpdate: layout.shouldAppUpdate,
  newVersion: layout.newVersion,
  defaultEditor: layout.defaultEditor,
  editor: layout.editor,
}))(SetDialog);
