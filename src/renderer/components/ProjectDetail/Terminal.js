import React, { Component, PropTypes } from 'react';
import { ipcRenderer, remote } from 'electron';
// import pubsub from 'electron-pubsub';
import classNames from 'classnames';
import Button from 'antd/lib/button';
import Select from 'antd/lib/select';
// import { findDOMNode } from 'react-dom';
import i18n from 'i18n';
// const pubsub = remote.require('electron-pubsub');
const { command } = remote.getGlobal('services');


class Terminal extends Component {
  constructor(props) {
    super(props);
    const { logType, name } = props;
    const task = remote.require('./services/task');
    const t = task.getTask(logType, name);

    if (t.log.length > 0) {
      this.state = {
        log: t.log,
        showClear: true
      };
    } else {
      this.state = {
        log: '',
        showClear: false
      };
    }
    this.handleChangeCustom = this.handleChangeCustom.bind(this);  
  }

  componentDidMount() {
    // pubsub.subscribe('task-ouput', this.onReceiveLog.bind(this));
    ipcRenderer.on('task-ouput', this.onReceiveLog.bind(this));
  }

  componentWillReceiveProps({ logType, name }) {
    if (logType !== this.props.logType || name !== this.props.name) {
      const task = remote.require('./services/task');
      const { log } = task.getTask(logType, name);
      if (log.length > 0) {
        this.setState({ log, showClear: true }, () => this.scrollToBottom());
      } else {
        this.setState({ log: '', showClear: false });
      }
      // const task = remote.getGlobal('cmd')[logType];
      // if (task && task[name]) {
        // this.setState({ log: task[name].log, showClear: true }, () => this.scrollToBottom());
      // } else {
      //   this.setState({ log: '', showClear: false });
      // }
    }
  }

  onReceiveLog(event, data) {
    const { name, logType } = this.props;
    if (name === data.name && logType === data.type) {
      this.setState({ log: data.log, showClear: true }, () => this.scrollToBottom());
    }
  }

  componentWillUmount() {
    ipcRenderer.removeAllListeners(this.onReceiveLog);
    // pubsub.unsubscribe('task-ouput');
  }

  scrollToBottom() {
    const prt = this.refs.wrap;
    const ele = this.refs.term;
    if (ele.offsetHeight > 370) {
      prt.scrollTop = ele.clientHeight - 370;
    }
  }

  handleChangeCustom(logType) {
    this.props.dispatch({
      type: 'task/changeStatus',
      payload: { logType }
    });
  }

  clearTerm() {
    const { name, logType } = this.props;
    command.clearLog({ name, type: logType });
    this.setState({ log: '', showClear: false });
  }

  render() {
    const { showClear, log } = this.state;
    const { hasSide, logType, otherCommands } = this.props;
    const selectValue = logType !== 'start' && logType !== 'build' ? logType : undefined;

    return (
      <div
        className={classNames({
          'terminal-wrap': true,
          'has-side': hasSide
        })}
      >
        <div className="terminal-tabs">
          <div
            className={classNames({
              'tabs-item': true,
              active: logType === 'start'
            })}
            onClick={() => this.handleChangeCustom('start')}
          >{i18n('project.tab.listen_log')}</div>
          <div
            className={classNames({
              'tabs-item': true,
              active: logType === 'build'
            })}
            onClick={() => this.handleChangeCustom('build')}
          >{i18n('project.tab.compile_log')}</div>
          { hasSide &&
            <Select placeholder={i18n('cmd.select.opt')}
              style={{ width: 120 }}
              onChange={this.handleChangeCustom}
              value={selectValue}
            >
            { otherCommands.map(cmd => <Select.Option value={cmd} key={cmd}>{cmd}</Select.Option>) }
            </Select>
          }
        </div>
        {
          showClear &&
          <Button ghost
            size="small" shape="circle"
            className="clear-btn"
            onClick={() => this.clearTerm()}
          ><i className="iconfont icon-clear" />
          </Button>
        }
        <div className="term-wrap" ref="wrap">
        <div
          className="term-container"
          ref="term"
          dangerouslySetInnerHTML={{ __html: log }} 
        />
        </div>
      </div>
    );
  }
}

Terminal.propTypes = {
  hasSide: PropTypes.bool.isRequired,
  otherCommands: PropTypes.array,
  logType: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default Terminal;
