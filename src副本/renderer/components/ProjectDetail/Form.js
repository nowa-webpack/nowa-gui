import React from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Message from 'antd/lib/message';
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
    if (next.path !== this.props.path) {
      this.old = { ...next.project };
      this.setState({
        name: next.name,
        port: next.port
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
  render() {
    const { name, port } = this.state;
    return (
      <form className="form" >
        <div className="form-item">
          <label>Project Name</label>
          <input type="text" onChange={e => this.setState({ name: e.target.value })} value={name} />
        </div>
        <div className="form-item">
        <label>Project Port</label>
        <input type="text" onChange={e => this.changePort(e.target.value)} value={port} />
        </div>
        <Button type="primary" size="large" onClick={() => this.handleSubmit()}>Submit</Button>
        <Button type="default" size="large" onClick={() => this.resetForm()}>Reset</Button>
      </form>
    );
  }
}

export default connect(({ project }) => ({ project: project.current }))(SettingForm);
