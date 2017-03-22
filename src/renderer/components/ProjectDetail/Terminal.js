import React, { Component, PropTypes } from 'react';
import { ipcRenderer, remote } from 'electron';
// import ansiHTML from 'ansi-html';
import classNames from 'classnames';
import Button from 'antd/lib/button';
import Select from 'antd/lib/select';
// import { findDOMNode } from 'react-dom';
import i18n from 'i18n';

const { command } = remote.getGlobal('services');


class Terminal extends Component {
  constructor(props) {
    super(props);
    const { logType, name } = props;
    const task = remote.getGlobal('cmd')[logType];
    if (task && task[name]) {
      this.state = {
        log: task[name].log,
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
    ipcRenderer.on('task-ouput', (event, data) => {
      const { name, logType } = this.props;
      if (name === data.name && logType === data.type) {
        this.setState({ log: data.log, showClear: true }, () => this.scrollToBottom());
      }
    });
  }

  componentWillReceiveProps({ logType, name }) {
    if (logType !== this.props.logType || name !== this.props.name) {
      const task = remote.getGlobal('cmd')[logType];
      console.log('task', task);
      if (task && task[name]) {
        this.setState({ log: task[name].log, showClear: true }, () => this.scrollToBottom());
      } else {
        this.setState({ log: '', showClear: false });
      }
    }
  }

  scrollToBottom() {
    const prt = this.refs.wrap;
    const ele = this.refs.term;
    if (ele.offsetHeight > 370) {
      prt.scrollTop = ele.clientHeight - 370;
    }
  }

  handleChangeCustom(logType) {
    console.log(logType);
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
            <Select placeholder={i18n('project.tab.custom_log')}
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
