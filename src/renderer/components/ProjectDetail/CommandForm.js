import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Message from 'antd/lib/message';
import Tag from 'antd/lib/tag';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';

import i18n from 'i18n';
// import { PORT_MATCH } from 'gui-const';

class CommandForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cmdName: '',
      cmdValue: '',
    };
  }
  componentWillReceiveProps(next) {
    
  }

  remove(cmd) {
    console.log(cmd)
    this.props.dispatch({
      type: 'task/removeSingleCommand',
      payload: {
        cmd
      }
    });
  }
  handleSubmit() {
    const { cmdName, cmdValue } = this.state;
    const { dispatch, commands } = this.props;

    if (commands[cmdName]) {
      Message.error('sss')
      return false;
    } else {
      dispatch({
        type: 'task/addSingleCommand',
        payload: {
          cmd: { name: cmdName, value: cmdValue }
        }
      });
      this.setState({
        cmdName: '',
        cmdValue: '',
      });
    }
  }
  
  closable = (cmd) => cmd !== 'start' && cmd !== 'build'

  render() {
    const { cmdName, cmdValue } = this.state;
    const { commands } = this.props;
    const cmdKeys = Object.keys(commands);

    return (
      <div>
        <div className="cmd-list">
          <div className="title">{i18n('project.meta.name')}</div>
          { cmdKeys.map(item =>
              <Tag
                key={item}
                closable={this.closable(item)}
                onClose={() => this.remove(item)}
                className="item"
                color="#88b0ce"
              >
                <b>{item}: </b> {commands[item]}
              </Tag>)}
        </div>
        <form className="cmd-form" >
          <Row justify="space-between" type="flex">

          <Col span={6} className="cmd-field">
            <label className="form-label">{i18n('project.meta.name')}:</label>
            <input type="text" className="lg"
              onChange={e => this.setState({ cmdName: e.target.value })} value={cmdName}
            />
          </Col> 
          <Col span={13} className="cmd-field">
            <label className="form-label">{i18n('project.meta.name')}:</label>
            <input type="text" className="lg"
              onChange={e => this.setState({ cmdValue: e.target.value })} value={cmdValue}
            />
          </Col>
          <Col span={4} className="cmd-field">
            <Button type="primary" onClick={() => this.handleSubmit()}>{i18n('form.submit')}</Button>
          </Col> 
          </Row>

        </form>
      </div>
    );
  }
}


CommandForm.propTypes = {
  // project: PropTypes.shape({
  //   name: PropTypes.string,
  //   path: PropTypes.string,
  //   port: PropTypes.string
  // }).isRequired,
  // commands: PropTypes.Object,
  dispatch: PropTypes.func.isRequired,
};

export default CommandForm;

// export default connect(({ project, task }) => ({
//   // project: project.current,
//   // commands: task.commands[project.current.path] || {},
// }))(CommandForm);
