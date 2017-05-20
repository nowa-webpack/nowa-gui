import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import { join, basename } from 'path';
import { remote } from 'electron';
import { homedir } from 'os';
import Button from 'antd/lib/button';
// import Message from 'antd/lib/message';
import Select from 'antd/lib/select';
import Input from 'antd/lib/input';
import Checkbox from 'antd/lib/checkbox';

import i18n from 'i18n-renderer-nowa';
import { hidePathString, msgError } from 'util-renderer-nowa';
import { NAME_MATCH } from 'const-renderer-nowa';
import OverwriteModal from './OverwriteModal';

class Setting extends Component {

  constructor(props) {
    super(props);
    const { selectExtendsProj, defaultRegistry } = props;

    const name = 'untitled';
    // const name = '';
    const basePath = join(homedir(), 'NowaProject2');

    const extraArgs = {};

    if (Object.keys(selectExtendsProj).length) {
      selectExtendsProj.prompts.forEach((item) => {
        extraArgs[item.name] = item.default || false;
      });
    }

    this.state = {
      basePath,
      projPath: join(basePath, name),
      showPath: join(basePath, name),
      description: 'An awesome project',
      author: process.env.USER || process.env.USERNAME || '',
      version: '1.0.0',
      homepage: '',
      registry: defaultRegistry,
      repository: '',
      extraArgs,
    };

    this.getExtendsHtml = this.getExtendsHtml.bind(this);
    this.goBack = this.goBack.bind(this);
  }

  selectPath() {
    try {
      const importPath = remote.dialog.showOpenDialog({ properties: ['openDirectory'] });
      const projPath = join(importPath[0], basename(this.state.projPath));
      const input = document.getElementById('pathInput');
      input.focus();
      input.selectionStart = input.value.length;
      // input.selectionEnd = input.value.length;
      this.setState({
        basePath: importPath[0],
        projPath,
        showPath: projPath,
        // projPath: join(importPath[0], this.state.name),
      });
    } catch (err) {
      console.log(err);
    }
  }

  changeName(name) {
    // const { basePath } = this.props.init;
    const { basePath } = this.state;

    this.setState({
      projPath: name ? join(basePath, name) : basePath,
      name
    });
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
    const { extraArgs, basePath, ...others } = this.state;
    const { dispatch } = this.props;
    const name = basename(others.projPath);

    if (!(NAME_MATCH.test(name))) {
      msgError(i18n('msg.invalidName'));
      return false;
    }

    const args = { ...others, ...extraArgs, name };

    dispatch({
      type: 'projectCreate/checkSetting',
      payload: args
    });
  }

  getExtendsHtml() {
    const { extraArgs } = this.state;
    const { selectExtendsProj } = this.props;
    return (
      <div className="ui-form-item">
          <label className="ui-form-label">{i18n('project.meta.others')}:</label>
          <div className="ui-form-checkbox-grp">
            {
              selectExtendsProj.prompts.map(item =>
                <Checkbox
                  key={item.name}
                  defaultChecked={item.default}
                  checked={extraArgs[item.name]}
                  onChange={() => {
                    extraArgs[item.name] = !extraArgs[item.name];
                    this.setState({ extraArgs });
                  }}
                >{item.message}</Checkbox>)
            }
          </div>
        </div>
    );
  }

  render() {
    const { projPath, registry, showPath } = this.state;
    const { selectExtendsProj, registryList } = this.props;
    let extendsHtml;

    if (Object.keys(selectExtendsProj).length) {
      extendsHtml = this.getExtendsHtml();
    }

    const pathIcon = (<i className="iconfont icon-folder" onClick={() => this.selectPath()} />);

    return (
      <div className="template-form">
        <form className="ui-form" >

          <div className="ui-form-item">
            <label className="ui-form-label">{i18n('project.meta.path')}:</label>
            <div className="ui-form-item-grp">
              <Input
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
              />
            </div>
          </div>

          <div className="ui-form-item">
            <label className="ui-form-label">{i18n('project.meta.npm_registry')}:</label>
            <Select
              style={{ width: 300 }}
              defaultValue={registry}
              onChange={value => this.setState({ registry: value })}
            >
              { registryList.map(item =>
                <Select.Option key={item} value={item}>{ item }</Select.Option>)
              }
            </Select>
          </div>

          { extendsHtml }

          <div className="ui-form-btns">
            <Button type="primary" size="large" onClick={() => this.handleSubmit()}>{i18n('form.submit')}</Button>
            <Button type="default" size="large" onClick={() => this.goBack()}>{i18n('form.back')}</Button>
          </div>
        </form>
        <OverwriteModal />
      </div>
    );
  }
}


Setting.propTypes = {
  selectExtendsProj: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
  defaultRegistry: PropTypes.string.isRequired,
  registryList: PropTypes.array.isRequired,
};


export default connect(({ setting, projectCreate }) => ({
  selectExtendsProj: projectCreate.selectExtendsProj,
  // showModal: projectCreate.showOverwriteModal,
  defaultRegistry: setting.registry,
  registryList: setting.registryList,
}))(Setting);
