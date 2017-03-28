import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Message from 'antd/lib/message';
// import Popconfirm from 'antd/lib/popconfirm';
import Switch from 'antd/lib/switch';
import classNames from 'classnames';

import i18n from 'i18n';
import { PORT_MATCH } from 'gui-const';

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
      mangle: typeof abc.mangle === 'undefined' ? false : abc.mangle,
      keepconsole: typeof abc.keepconsole === 'undefined' ? false : abc.keepconsole,
      exportcss: typeof abc.exportcss === 'undefined' ? true : abc.exportcss,
      skipminify: typeof abc.skipminify === 'undefined' ? false : abc.skipminify,
    };

    if (!state.skipminify) {
      state.minifyExtension = abc.minifyExtension || '';
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
    const { mangle, keepconsole, exportcss, skipminify, minifyExtension } = this.state;

    let minifyField = {};

    if (skipminify) {
      minifyField.disabled = true;
    }

    return (
      <form className="ui-form" >
        <div className="form-item">
          <label className="form-label">Mangle:</label>
          <Switch size="default" checked={mangle}
            onChange={checked => this.setState({ mangle: checked })}
          />
        </div>

        <div className="form-item">
          <label className="form-label">Keepconsole:</label>
          <Switch size="default" checked={keepconsole}
            onChange={checked => this.setState({ keepconsole: checked })}
          />
        </div>

        <div className="form-item">
          <label className="form-label">Exportcss:</label>
          <Switch size="default" checked={exportcss}
            onChange={checked => this.setState({ exportcss: checked })}
          />
        </div>

        <div className="form-item">
          <label className="form-label">Skipminify:</label>
          <Switch size="default" checked={skipminify}
            onChange={checked => this.setState({ skipminify: checked })}
          />
        </div>

        <div className="form-item">
          <label className="form-label">MinifyExtension:</label>
          <input type="text"
            className={classNames({
              sm: true,
              disabled: skipminify
            })}
            onChange={e => this.setState({ minifyExtension: e.target.value })}
            value={minifyExtension}
            {...minifyField}
          />
        </div>
        <div className="form-btns">
          <Button type="primary" size="default" onClick={() => this.handleSubmit()}>{i18n('form.submit')}</Button>
        </div>
      </form>
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
