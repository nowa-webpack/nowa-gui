import React, { Component, PropTypes } from 'react';
import { ipcRenderer, remote } from 'electron';
import ansiHTML from 'ansi-html';
import classNames from 'classnames';
import Button from 'antd/lib/button';
import Select from 'antd/lib/select';
// import { findDOMNode } from 'react-dom';
import i18n from 'i18n';


class Terminal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      logs: '',
      showClear: true
    };    
  }

  handleChangeCustom() {

  }

  render() {
    const { showClear, logs } = this.state;
    const { hasSide, logType, otherCommands } = this.props;
    return (
      <div
        className={classNames({
          'terminal-wrap': true,
          'has-side': hasSide
        })}
        ref="wrap"
      >
        <div className="terminal-tabs">
          <div
            className={classNames({
              'tabs-item': true,
              active: logType === 'start'
            })}
          >{i18n('project.tab.listen_log')}</div>
          <div
            className={classNames({
              'tabs-item': true,
              active: logType === 'build'
            })}
          >{i18n('project.tab.compile_log')}</div>
          { hasSide &&
            <Select placeholder={i18n('project.tab.custom_log')}
              style={{ width: 120 }}
              onChange={() => this.handleChangeCustom}
            >
            { otherCommands.map(cmd => <Select.Option value={cmd} key={cmd}>{cmd}</Select.Option>) }
            </Select>
          }
        </div>
        <div
          className="term-container"
          ref="term"
          dangerouslySetInnerHTML={{ __html: logs }} 
        />
        {
          showClear &&
          <Button ghost
            size="small" shape="circle"
            className="clear-btn"
            onClick={() => this.clearTerm()}
          ><i className="iconfont icon-clear" />
          </Button>
        }
      </div>
    );
  }
}

Terminal.propTypes = {
  hasSide: PropTypes.bool.isRequired,
  otherCommands: PropTypes.array,
  logType: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,

};

export default Terminal;
