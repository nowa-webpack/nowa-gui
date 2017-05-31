import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import Icon from 'antd/lib/icon';
import Select from 'antd/lib/select';
import classNames from 'classnames';

import i18n from 'i18n-renderer-nowa';

const getCmdList = ({ current, commands }) => {
  const cmdList = commands[current.path];
  return Object.keys(cmdList).filter(cmd => cmd !== 'start' && cmd !== 'build');
};

const getSelectCmd = (type) => type !== 'start' && type !== 'build' ? type : undefined;

class Terminal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showClear: true,
      cmdNames: getCmdList(props),
      selectCmd: getSelectCmd(props.taskType),
    };
    this.changeTerminalTab = this.changeTerminalTab.bind(this);
  }

  componentWillReceiveProps({ taskType, current, commands }) {
    if (taskType !== this.props.taskType && current.path === this.props.current.path) {
      this.setState({
        selectCmd: getSelectCmd(taskType),
      });
    }

    if (current.path !== this.props.current.path) {
      
      this.setState({
        selectCmd: getSelectCmd(taskType),
        cmdNames: getCmdList({ current, commands })
      });
    }
  }

  // componentDidMount() {
  //   this.setState({ cmdNames: getCmdList(this.props) });
  // }
  

  clearTerminal() {

  }

  changeTerminalTab(taskType) {
    this.props.dispatch({
      type: 'task/changeStatus',
      payload: { taskType }
    });
  }

  render() {
    const { expanded, onToggle, taskType } = this.props;
    const { showClear, cmdNames, selectCmd } = this.state;
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
          { cmdNames.length > 0 &&
            <Select placeholder={i18n('cmd.select.opt')}
              style={{ width: 120 }}
              onChange={this.changeTerminalTab}
              value={selectCmd}
            >{
              cmdNames.map(cmd => <Select.Option value={cmd} key={cmd}>{cmd}</Select.Option>)
            }
            </Select>
          }
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
};

export default connect(({ project, setting, task }) => ({
  current: project.current,
  commands: task.commandSet || {},
  taskType: task.taskType,
  // registry: setting.registry,
  // online: layout.online
}))(Terminal);
