import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import { join } from 'path';
import fs from 'fs-extra';
import { remote } from 'electron';
import osHomedir from 'os-homedir';
import Button from 'antd/lib/button';
import Message from 'antd/lib/message';
import Select from 'antd/lib/select';
import Input from 'antd/lib/input';
import Checkbox from 'antd/lib/checkbox';

import i18n from 'i18n';
import { hidePathString } from 'gui-util';
import { NAME_MATCH } from 'gui-const';
import { getLocalProjects } from 'gui-local';

import OverrideModal from './OverrideModal';

const registryList = [{
  name: 'cnpm (https://registry.npm.taobao.org)',
  value: 'cnpm'
  // value: 'https://registry.npm.taobao.org'
}, {
  name: 'tnpm (http://registry.npm.alibaba-inc.com)',
  value: 'tnpm'
  // value: 'http://registry.npm.alibaba-inc.com'
}, {
  name: 'npm (https://registry.npmjs.org)',
  value: 'npm'
  // value: 'https://registry.npmjs.org'
}];


class Form extends Component {

  constructor(props) {
    super(props);
    const { extendsProj, defaultRegistry } = props;

    // const name = 'untitled';
    const name = '';
    const basePath = join(osHomedir(), 'NowaProject');

    const extendsArgs = {};

    if (Object.keys(extendsProj).length) {
      extendsProj.prompts.forEach((item) => {
        extendsArgs[item.name] = item.default || false;
      });
    }

    this.state = {
      basePath,
      extendsArgs,

      projPath: join(basePath, name),
      name,
      description: 'An awesome project',
      author: process.env.USER || process.env.USERNAME || '',
      version: '1.0.0',
      homepage: '',
      // registry: NPM_MAP[defaultRegistry],
      registry: defaultRegistry,
      // registry: 'https://registry.npm.taobao.org',
      repository: '',
    };
    this.overwrite = this.overwrite.bind(this);
  }

  componentWillReceiveProps({ isGitEmptyFolder, next, dispatch }) {
    if (isGitEmptyFolder !== this.props.isGitEmptyFolder && isGitEmptyFolder) {
      dispatch({
        type: 'init/changeStatus',
        payload: { isGitEmptyFolder: false }
      });
      next();
    }
  }

  selectPath() {
    try {
      const importPath = remote.dialog.showOpenDialog({ properties: ['openDirectory'] });
      this.setState({
        basePath: importPath[0],
        projPath: join(importPath[0], this.state.name),
      });
    } catch (err) {
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

  handleSubmit() {
    const { extendsArgs, basePath, ...others } = this.state;
    const { dispatch, next } = this.props;

    if (!others.name) {
      Message.error(i18n('msg.nameRequired'));
      return false;
    }

    if (!(NAME_MATCH.test(others.name))) {
      Message.error(i18n('msg.invalidName'));
      return false;
    }

    const args = { ...others, ...extendsArgs };

    console.log('args', args);

    dispatch({
      type: 'init/setUserAnswers',
      payload: args
    });

    const storeProjects = getLocalProjects();

    if (storeProjects.filter(item => item.path === args.projPath).length > 0) {
      Message.error(i18n('msg.existed'));
      return false;
    }

    if (fs.existsSync(join(basePath, others.name))) {
      dispatch({
        type: 'init/checkOverrideFiles',
      });
      // next();
    } else {
      this.overwrite();
    }
  }

  overwrite() {
    const { dispatch, next } = this.props;
    dispatch({
      type: 'init/copyTemplateToTarget',
    });
    dispatch({
      type: 'init/changeStatus',
      payload: { showFormModal: false }
    });
    next();
  }

  render() {
    const { projPath, name, registry, extendsArgs } = this.state;
    const { extendsProj, prev } = this.props;
    let extendsHtml;

    if (Object.keys(extendsProj).length) {
      extendsHtml = (
        <div className="form-item">
          <label className="form-label">{i18n('project.meta.others')}:</label>
          <div className="checkbox-grp">
            {
              extendsProj.prompts.map((item) => {
                // if (item.type === 'confirm') {
                return (
                  <Checkbox
                    key={item.name}
                    defaultChecked={item.default}
                    checked={extendsArgs[item.name]}
                    onChange={(e) => {
                      // extendsArgs[item.name] = e.target.checked;
                      extendsArgs[item.name] = !extendsArgs[item.name];
                      this.setState({ extendsArgs });
                    }}
                  >{item.message}</Checkbox>
                );
                // }
              })
            }
          </div>
        </div>);
    }

    const pathIcon = (<i className="iconfont icon-folder" onClick={() => this.selectPath()} />);

    return (
      <div className="template-form">
        <form className="ui-form" >

          <div className="form-item">
            <label className="form-label">{i18n('project.meta.name')}:</label>
            <input type="text" className="lg"
              placeholder="untitled"
              onChange={e => this.changeName(e.target.value)} value={name} 
            />
          </div>

          <div className="form-item">
            <label className="form-label">{i18n('project.meta.path')}:</label>
            <div className="form-item-grp">
            <Input addonAfter={pathIcon} value={hidePathString(projPath, 45)} disabled />
            </div>
          </div>

          <div className="form-item">
            <label className="form-label">{i18n('project.meta.npm_registry')}:</label>
            <Select
              style={{ width: 300 }}
              defaultValue={registry}
              onChange={(value) => this.setState({ registry: value })}
            >
              { registryList.map(item =>
                <Select.Option key={item} value={item.value}>{ item.name }</Select.Option>)
              }
            </Select>
          </div>

          { extendsHtml }

          <div className="form-btns">
            <Button type="primary" size="large" onClick={() => this.handleSubmit()}>{i18n('form.submit')}</Button>
            <Button type="default" size="large" onClick={() => prev()}>{i18n('form.back')}</Button>
          </div>
        </form>
        <OverrideModal onOverride={this.overwrite} />
      </div>
    );
  }
}

Form.propTypes = {
  extendsProj: PropTypes.object,
  isGitEmptyFolder: PropTypes.bool.isRequired,
  prev: PropTypes.func.isRequired,
  next: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  defaultRegistry: PropTypes.string.isRequired,
};


export default connect(({ init, layout }) => ({ 
  extendsProj: init.extendsProj,
  isGitEmptyFolder: init.isGitEmptyFolder,
  defaultRegistry: layout.registry
}))(Form);
