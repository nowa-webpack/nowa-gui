import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import { join } from 'path';
import fs from 'fs-extra';
import Button from 'antd/lib/button';
import Message from 'antd/lib/message';
import Select from 'antd/lib/select';
import Input from 'antd/lib/input';
import Checkbox from 'antd/lib/checkbox';
import i18n from 'i18n';

import { hidePathString } from '../../util';


class Form extends Component {

  constructor(props) {
    super(props);

    const { basePath, extendsProj } = props.init;

    // const name = 'untitled';
    const name = '';

    this.registryList = ['https://registry.npm.taobao.org', 'http://registry.npm.alibaba-inc.com', 'https://registry.npmjs.org'];

    const extendsArgs = {};

    if (Object.keys(extendsProj).length) {
      extendsProj.prompts.map((item) => {
        extendsArgs[item.name] = item.default || false;
      });
    }

    this.state = {
      projPath: join(basePath, name),
      name,
      description: 'An awesome project',
      author: process.env.USER || process.env.USERNAME || '',
      version: '1.0.0',
      homepage: '',
      registry: 'https://registry.npm.taobao.org',
      repository: '',
      extendsArgs
    };

    this.old = this.state;
  }
  
  componentWillReceiveProps({ init }) {

    const { basePath } = this.props.init;
    if (init.basePath !== basePath) {
      this.setState({
        projPath: join(init.basePath, this.state.name)
      });
    }
  }

  selectPath() {
    const { dispatch } = this.props;

    dispatch({
      type: 'init/selectBaseProjectPath',
      payload: {
        isInit: false
      }
    });
  }

  changeName(name) {
    const { basePath } = this.props.init;

    this.setState({
      projPath: name ? join(basePath, name) : basePath,
      name
    });
  }

  handleSubmit() {
    const { extendsArgs, ...others } = this.state;
    const { dispatch, init, next } = this.props;
    const { basePath } = init;

    if (fs.existsSync(join(basePath, others.name))) {
      Message.error(i18n('msg.existed'));
      return false;
    }

    if (!(/^[A-Za-z0-9_-]+$/.test(others.name))) {
      Message.error(i18n('msg.invalidName'));
      return false;
    }

    if (!(/^\d+\.\d+\.\d+([\.\-\w])*$/.test(others.version))) {
      Message.error(i18n('msg.invalidVersion'));
      return false;
    }

    const args = { ...others, ...extendsArgs };

    console.log(args);
    next();

    dispatch({
      type: 'init/getAnswserArgs',
      payload: args
    });
  }

  resetForm() {
    const { extendsProj } = this.props.init;
    const extendsArgs = {};

    if (Object.keys(extendsProj).length) {
      extendsProj.prompts.map((item) => {
        extendsArgs[item.name] = item.default || false;
      });
    }

    this.old = { ...this.old, extendsArgs };

    this.props.dispatch({
      type: 'init/selectBaseProjectPath',
      payload: {
        isInit: true
      }
    });

    this.setState(this.old);
  }

  render() {
    const { projPath, name, registry, extendsArgs } = this.state;
    const { init: { extendsProj }, prev } = this.props;
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

    const pathIcon = <i className="iconfont icon-folder" onClick={() => this.selectPath()} />;

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
              { this.registryList.map(item =>
                <Select.Option key={item} value={item}>{ item }</Select.Option>)
              }
            </Select>
          </div>

          { extendsHtml }
          <div className="form-btns">
            <Button type="primary" size="large" onClick={() => this.handleSubmit()}>{i18n('form.submit')}</Button>
            <Button type="default" size="large" onClick={() => prev()}>{i18n('form.back')}</Button>
          </div>
        </form>
      </div>
    );
  }
}

Form.propTypes = {
  init: PropTypes.object.isRequired,
  prev: PropTypes.func.isRequired,
  next: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect(({ init }) => ({ init }))(Form);
