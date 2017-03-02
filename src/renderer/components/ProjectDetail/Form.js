import React from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Message from 'antd/lib/message';
import Popconfirm from 'antd/lib/popconfirm';

import i18n from 'i18n';

class SettingForm extends React.Component {
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
    if (next.project.path !== this.props.project.path) {
      this.old = { ...next.project };
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
    if (/^([1-9]|[1-9]\d{1,3}|[1-6][0-5][0-5][0-3][0-5])$/.test(value)) {
      this.setState({ port: value });
    } else {
      Message.error('Invalid Port!');
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
          <label>{i18n('project.meta.name')}:</label>
          <input type="text" className="lg"
            onChange={e => this.setState({ name: e.target.value })} value={name} />
        </div>
        <div className="form-item">
          <label>{i18n('project.meta.port')}:</label>
          <input type="text" className="sm"
            onChange={e => this.changePort(e.target.value)} value={port} />
        </div>
        <div className="form-btns">
          <Button type="primary" size="large" onClick={() => this.handleSubmit()}>{i18n('form.submit')}</Button>
           <Popconfirm
            placement="bottomRight"
            title={'Are you sure remove this project?'}
            onConfirm={() => this.removeProj()}
            okText="Yes"
            cancelText="No"
          >
          <Button type="danger" size="large" icon="delete" onClick={() => this.handleSubmit()}>Delete</Button>
          </Popconfirm>
        </div>
      </form>
    );
  }
}

export default connect(({ project }) => ({ project: project.current }))(SettingForm);
