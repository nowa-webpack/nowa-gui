import React, { Component, PropTypes } from 'react';
import { shell } from 'electron';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Tooltip from 'antd/lib/tooltip';
import Message from 'antd/lib/message';
import Switch from 'antd/lib/switch';
import classNames from 'classnames';

import i18n from 'i18n';

class BuildConfigForm extends Component {
  constructor(props) {
    super(props);
    this.state = this.getInitState(props.project.abc);
  }

  componentWillReceiveProps({ project, path }) {
    if (path !== this.props.project.path) {
      this.setState(this.getInitState(project.abc));
    }
  }

  getInitState(abc) {
    const state = {
      dist: typeof abc.dist === 'undefined' ? 'dist' : abc.dist,
      mangle: typeof abc.mangle === 'undefined' ? false : abc.mangle,
      keepconsole: typeof abc.keepconsole === 'undefined' ? false : abc.keepconsole,
      exportcss: typeof abc.exportcss === 'undefined' ? true : abc.exportcss,
      skipminify: typeof abc.skipminify === 'undefined' ? false : abc.skipminify,
      // minifyExtension: typeof abc.minifyExtension === 'undefined' ? false : abc.skipminify,
    };

    if (!state.skipminify) {
      state.minifyExtension = abc.minifyExtension || '';
    } else {
      state.minifyExtension = '';
    }

    return state;
  }

  saveConfig(config) {
    const { dispatch, project } = this.props;
    const abc = { ...project.abc, ...config };
    dispatch({
      type: 'project/updateABC',
      payload: { abc, project }
    });
    this.setState(config);
  }

  handleSubmit() {
    const { dispatch, project } = this.props;
    const abc = { ...project.abc, ...this.state };
    dispatch({
      type: 'project/updateABC',
      payload: { abc, project }
    });
    Message.success(i18n('msg.updateSuccess'));
  }
 
  render() {
    const { mangle, keepconsole, exportcss, skipminify, minifyExtension, dist } = this.state;

    let minifyField = {};

    if (skipminify) {
      minifyField.disabled = true;
    }

    return (
      <div style={{ position: 'relative' }}>
        <Tooltip placement="top" title={i18n('foot.help')} >
          <Button type="primary" icon="question" shape="circle" size="small" ghost
            className="help-btn"
            onClick={() => shell.openExternal('http://groups.alidemo.cn/alinw-tools/nowa/ben_di_kai_fa.html')}
          />
        </Tooltip>
        <form className="setting-form" >
          <div className="setting-form-item sm">
            <label className="setting-form-label">Mangle:</label>
            <Switch size="default" checked={mangle}
              onChange={checked => this.setState({ mangle: checked })}
            />
          </div>

          <div className="setting-form-item sm">
            <label className="setting-form-label">Keepconsole:</label>
            <Switch size="default" checked={keepconsole}
              onChange={checked => this.setState({ keepconsole: checked })}
            />
          </div>

          <div className="setting-form-item sm">
            <label className="setting-form-label">Exportcss:</label>
            <Switch size="default" checked={exportcss}
              onChange={checked => this.setState({ exportcss: checked })}
            />
          </div>

          <div className="setting-form-item sm">
            <label className="setting-form-label">Skipminify:</label>
            <Switch size="default" checked={skipminify}
              onChange={checked => this.setState({ skipminify: checked })}
            />
          </div>
          <div className="setting-form-item sm">
            <label className="setting-form-label">Dist:</label>
            <input type="text"
              className="lg"
              onChange={e => this.setState({ dist: e.target.value })}
              value={dist}
            />
          </div>
          <div className="setting-form-item sm">
            <label className="setting-form-label">MinifyExtension:</label>
            <input type="text"
              className={classNames({
                sm: true,
                lg: false,
                disabled: skipminify
              })}
              onChange={e => this.setState({ minifyExtension: e.target.value })}
              value={minifyExtension}
              {...minifyField}
            />
          </div>
          
          <div className="setting-form-btns">
            <Button type="primary" size="default" onClick={() => this.handleSubmit()}>{i18n('form.submit')}</Button>
          </div>
        </form>
      </div>
    );
  }
}

BuildConfigForm.propTypes = {
  project: PropTypes.shape({
    abc: PropTypes.object,
    path: PropTypes.string,
    // name: PropTypes.string,
    // port: PropTypes.string
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect(({ project }) => ({ project: project.current }))(BuildConfigForm);
