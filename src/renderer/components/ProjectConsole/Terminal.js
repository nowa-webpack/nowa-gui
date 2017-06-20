import React, { Component, PropTypes } from 'react';
import { ipcRenderer, remote } from 'electron';
import { connect } from 'dva';
import ansiHTML from 'ansi-html';
import Icon from 'antd/lib/icon';
import Select from 'antd/lib/select';
import classNames from 'classnames';

import i18n from 'i18n-renderer-nowa';

const { tasklog } = remote.getGlobal('services');

const getCmdList = ({ current, commands }) => {
  const cmdList = commands[current.path];
  return Object.keys(cmdList).filter(cmd => cmd !== 'start' && cmd !== 'build') || [];
};

function getSelectCmd(type) {
  return type !== 'start' && type !== 'build' ? type : undefined;
}

class Terminal extends Component {
  constructor(props) {
    super(props);
    const { log } = tasklog.getTask(props.taskType, props.current.path);
    this.state = {
      showClear: false,
      cmdNames: getCmdList(props),
      selectCmd: getSelectCmd(props.taskType),
      log: ansiHTML(log.replace(/\n/g, '<br>')),
    };

    this.changeTerminalTab = this.changeTerminalTab.bind(this);
    this.onReceiveLog = this.onReceiveLog.bind(this);
  }

  componentDidMount() {
    ipcRenderer.on('task-output', this.onReceiveLog);
  }

  componentWillReceiveProps({ taskType, current, commands }) {
    if (taskType !== this.props.taskType && current.path === this.props.current.path) {
      const { log } = tasklog.getTask(taskType, current.path);

      if (log.length > 0) {
        this.setState({
          log: ansiHTML(log.replace(/\n/g, '<br>')),
          showClear: true,
          selectCmd: getSelectCmd(taskType),
          cmdNames: getCmdList({ current, commands }),
        }, () => this.scrollToBottom());
      } else {
        this.setState({
          log: '',
          showClear: false,
          selectCmd: getSelectCmd(taskType),
          cmdNames: getCmdList({ current, commands }),
        });
      }
    }

    if (current.path !== this.props.current.path) {
      const { log } = tasklog.getTask(taskType, current.path);
      if (log.length > 0) {
        this.setState({
          log: ansiHTML(log.replace(/\n/g, '<br>')),
          showClear: true,
          selectCmd: getSelectCmd(taskType),
          cmdNames: getCmdList({ current, commands }),
        }, () => this.scrollToBottom());
      } else {
        this.setState({
          log: '',
          showClear: false,
          selectCmd: getSelectCmd(taskType),
          cmdNames: getCmdList({ current, commands })
        });
      }
    }
  }

  onReceiveLog(event, { command, projPath, text }) {
    const { current, taskType } = this.props;
    if (current.path === projPath && taskType === command) {
      this.setState({ log: ansiHTML(text.replace(/\n/g, '<br>')), showClear: true }, () => this.scrollToBottom());
    }
  }

  componentWillUmount() {
    ipcRenderer.removeAllListeners(this.onReceiveLog);
  }

  clearTerminal() {
    const { taskType, current } = this.props;
    tasklog.clearLog(taskType, current.path);
    this.setState({ log: '', showClear: false });
  }

  scrollToBottom() {
    const prt = this.refs.wrap;
    const ele = this.refs.terminal;
    if (ele.offsetHeight > prt.clientHeight) {
      prt.scrollTop = ele.clientHeight - prt.clientHeight;
    }
  }

  changeTerminalTab(taskType) {
    this.props.dispatch({
      type: 'task/changeStatus',
      payload: { taskType }
    });
  }

  render() {
    const { expanded, onToggle, taskType, plugins } = this.props;
    const { showClear, cmdNames, selectCmd, log } = this.state;
    const iconType = expanded ? 'shrink' : 'arrows-alt';

    return (
      <div className="project-terminal">
        <div className="project-terminal-btn expand"
          onClick={() => onToggle()}
        ><Icon type={iconType} /></div>

        { showClear &&
          <div className="project-terminal-btn clear"
            onClick={() => this.clearTerminal()}
          ><i className="iconfont icon-clear" /></div>
        }
        <div className="project-terminal-tabs">
          <div
            className={classNames({
              'project-terminal-tabs-item': true,
              active: taskType === 'start'
            })}
            onClick={() => this.changeTerminalTab('start')}
          >{i18n('project.tab.listen_log')}</div>
          <div
            className={classNames({
              'project-terminal-tabs-item': true,
              active: taskType === 'build'
            })}
            onClick={() => this.changeTerminalTab('build')}
          >{i18n('project.tab.compile_log')}</div>
          <Select placeholder={i18n('cmd.select.opt')}
            style={{ width: 120 }}
            onChange={this.changeTerminalTab}
            value={selectCmd}
          >
            {
              plugins.length &&
              plugins.map(({ file }) =>
                <Select.Option value={file.name.en} key={file.name.en}>{file.name.en}</Select.Option>)
            }
            {
              cmdNames.map(cmd => <Select.Option value={cmd} key={cmd}>{cmd}</Select.Option>)
            }
          </Select>
        </div>

        <div className="project-terminal-content" ref="wrap">
          <div dangerouslySetInnerHTML={{ __html: log }} ref="terminal" />
        </div>
      </div>
    );
  }
}


Terminal.propTypes = {
  current: PropTypes.shape({
    path: PropTypes.string.isRequired,
    pkg: PropTypes.object.isRequired,
  }).isRequired,
  onToggle: PropTypes.func.isRequired,
  expanded: PropTypes.bool.isRequired,
  commands: PropTypes.object.isRequired,
  taskType: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  plugins: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default connect(({ project, task, plugin }) => ({
  current: project.current,
  commands: task.commandSet || {},
  taskType: task.taskType,
  plugins: plugin.UIPluginList
}))(Terminal);
