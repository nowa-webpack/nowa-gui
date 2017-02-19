import React, { Component } from 'react';
import { connect } from 'dva';
import Layout from 'antd/lib/layout';
import Button from 'antd/lib/button';
import Message from 'antd/lib/message';
import Select from 'antd/lib/select';
import Switch from 'antd/lib/switch';
import { join } from 'path';
import fs from 'fs-extra';
const { Header, Content } = Layout;

import i18n from 'i18n';


class Form extends Component {

  constructor(props) {
    super(props);

    const { basePath, sltTemp, extendsProj } = props.init;

    // const name = sltTemp.name + '-demo';
    const name = `${sltTemp.name}-demo`;

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
    const { dispatch, init } = this.props;
    const { sltTemp, sltTag, basePath } = init;

    const isExisted = fs.existsSync(join(basePath, others.name));

    if (isExisted) {
      Message.error('The project path is already existed!');
      return false;
    }

    if (!(/^\d+\.\d+\.\d+([\.\-\w])*$/.test(others.version))) {
      Message.error('Invalid Version!');
      return false;
    }

    const args = { ...others, ...extendsArgs };

    // args.template = sltTemp.branch.filter(item => item.name === sltTag)[0].zipfile;

    console.log(args)

    dispatch({
      type: 'init/getAnswserArgs',
      payload: args
    });
  }
  resetForm() {
    // console.log(this.old)

    const { extendsProj } = this.props.init;
    const extendsArgs = {};
    if (Object.keys(extendsProj).length) {
      extendsProj.prompts.map((item) => {
        extendsArgs[item.name] = item.default || false;
      });
    }

    this.old = { ...this.old, extendsArgs };
    // console.log(this.old)
    this.props.dispatch({
      type: 'init/selectBaseProjectPath',
      payload: {
        isInit: true
      }
    });

    this.setState(this.old);
  }

  backToHome() {
    const { dispatch } = this.props;

    dispatch({
      type: 'layout/changeStatus',
      payload: {
        showCreateForm: false
      }
    });
  }
  render() {
    const { projPath, name, description, author, version, homepage, registry, repository, extendsArgs } = this.state;
    const { extendsProj } = this.props.init;

    const extendsHtml = Object.keys(extendsProj).length > 0 ?
        (<div className="extends-form">
          {extendsProj.prompts.map((item) => {
            if (item.type === 'confirm') {
              return (
                <div className="form-item" key={item.name}>
                  <label className="switch-label">{item.message}</label>
                  <Switch
                    defaultChecked={item.default}
                    checked={extendsArgs[item.name]}
                    onChange={(checked) => {
                      extendsArgs[item.name] = checked;
                      this.setState({ extendsArgs });
                    }}
                  />
                </div>
              );
            }
          })}
        </div>)
        : null;

    return (
      <Layout className="welcome" style={{ background: '#fff' }}>
        <Header className="welcome-header">
          <h2 className="welcome-title">Init Form</h2>
        </Header>
        <Content>
        <form className="form-inline" >

          <div className="form-item">
            <label>Project Path</label>
            <div className="path">{projPath}
              <Button
                type="default"
                className="addon"
                size="small"
                onClick={() => this.selectPath()}
              >
                <i className="iconfont icon-folder" />
              </Button>
            </div>
          </div>

          <div className="form-item">
            <label>Project Name</label>
            <input type="text" onChange={e => this.changeName(e.target.value)} value={name} />
          </div>

          <div className="form-item">
            <label>Project Description</label>
            <input type="text" onChange={e => this.setState({ description: e.target.value })} value={description}/>
          </div>

          <div className="form-item">
            <label>Author Name</label>
            <input type="text" onChange={e => this.setState({ author: e.target.value })} value={author} />
          </div>

          <div className="form-item">
            <label>Project Version</label>
            <input type="text" onChange={e => this.setState({ version: e.target.value })} value={version} />
          </div>

          <div className="form-item">
            <label>Project Homepage</label>
            <input type="text" onChange={e => this.setState({ homepage: e.target.value })} value={homepage} />
          </div>

          <div className="form-item">
            <label>Project Repository</label>
            <input type="text" onChange={e => this.setState({ repository: e.target.value })} value={repository} />
          </div>

          <div className="form-item">
            <label>Npm Registry</label>
            <Select
              style={{ width: 250 }}
              defaultValue={registry}
              onChange={this.changeRegistry}
            >
              { this.registryList.map(item =>
                <Select.Option key={item} value={item}>{ item }</Select.Option>)
              }
            </Select>
          </div>

          { extendsHtml }

          <div className="form-btns">
            <Button type="primary" size="large" onClick={() => this.handleSubmit()}>Submit</Button>
            <Button type="default" size="large" onClick={() => this.resetForm()}>Reset</Button>
            <Button type="default" size="large" onClick={() => this.backToHome()}>Back</Button>
          </div>
        </form>
        </Content>
      </Layout>
    );
  }
}

export default connect(({ init }) => ({ init }))(Form);
