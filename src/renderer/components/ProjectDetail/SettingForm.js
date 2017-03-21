import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Message from 'antd/lib/message';
import Popconfirm from 'antd/lib/popconfirm';

import i18n from 'i18n';
import { PORT_MATCH } from 'gui-const';

class SettingForm extends Component {
  constructor(props) {
    super(props);
    const project = props.project;
    this.state = {
      name: project.name,
      port: project.port
    };
    this.old = { ...project };
  }
  componentWillReceiveProps(next) {
    this.old = { ...next.project };
    if (next.project.path !== this.props.project.path) {
      this.setState({
        name: next.project.name,
        port: next.project.port
      });
    }
  }
  handleSubmit() {
    const { dispatch } = this.props;
    dispatch({
      type: 'project/update',
      payload: {
        project: this.state,
        old: this.old,
      }
    });
  }
  resetForm() {
    this.setState({
      name: this.old.name,
      port: this.old.port
    });
  }
  changePort(value) {
    if (PORT_MATCH.test(+value)) {
      this.setState({ port: value });
    } else {
      Message.error(i18n('msg.invalidPort'));
    }
  }
  removeProj() {
    const { dispatch, project } = this.props;
    dispatch({
      type: 'project/remove',
      payload: { project }
    });
  }
  render() {
    const { name, port } = this.state;
    return (
      <form className="ui-form" >
        <div className="form-item">
          <label className="form-label">{i18n('project.meta.name')}:</label>
          <input type="text" className="lg"
            onChange={e => this.setState({ name: e.target.value })} value={name}
          />
        </div>
        <div className="form-item">
          <label className="form-label">{i18n('project.meta.port')}:</label>
          <input type="text" className="sm"
            onChange={e => this.changePort(e.target.value)} value={port}
          />
        </div>
        <div className="form-btns">
          <Button type="primary" size="large" onClick={() => this.handleSubmit()}>{i18n('form.submit')}</Button>
          <Popconfirm
            placement="bottomRight"
            title={i18n('msg.removeProject')}
            onConfirm={() => this.removeProj()}
            okText={i18n('form.ok')}
            cancelText={i18n('form.cancel')}
          ><Button type="danger" size="large" icon="delete">{i18n('form.delete')}</Button>
          </Popconfirm>
        </div>
      </form>
    );
  }
}

SettingForm.propTypes = {
  project: PropTypes.shape({
    name: PropTypes.string,
    path: PropTypes.string,
    port: PropTypes.string
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect(({ project }) => ({ project: project.current }))(SettingForm);
