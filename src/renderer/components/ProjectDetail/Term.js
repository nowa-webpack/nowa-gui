import React, { Component, PropTypes } from 'react';
import ansiHTML from 'ansi-html';
import Button from 'antd/lib/button';


class Terminal extends Component {
  constructor(props) {
    super(props);

    const { terminal, name } = props;

    this.mainLogs = {};

    if (terminal.log) {
      this.mainLogs[name] = terminal.log;
    }

    this.state = {
      showClear: false,
      logs: this.mainLogs[name] || ''
    };
  }

  componentDidMount() {
    const { terminal, name, dispatch, type } = this.props;
    this.unMount = false;
    if (terminal.term) {
      terminal.term.stdout.on('data', (data) => {
        this.writeData(data, name);
      });

      terminal.term.stderr.on('data', (data) => {
        this.writeData(data, name);
        console.log('err', type);
        
        dispatch({
          type: 'task/taskErr',
          payload: {
            type,
            filePath: name
          }
        });
      });

      terminal.term.on('exit', () => {
        dispatch({
          type: 'task/exit',
          payload: {
            name,
            type
          }
        });
      });
    }
  }

  componentWillReceiveProps({ terminal, name, dispatch, type }) {
    const { terminal: oldTermimal, name: oldName } = this.props;
    if (!oldTermimal.term && terminal.term) {
      if (oldName === name) {
        terminal.term.stdout.on('data', (data) => {
          this.writeData(data, name);
        });

        terminal.term.stderr.on('data', (data) => {
          this.writeData(data, name);
          dispatch({
            type: 'task/taskErr',
            payload: {
              type,
              filePath: name
            }
          });
        });

        terminal.term.on('exit', () => {
          dispatch({
            type: 'task/exit',
            payload: {
              name,
              type
            }
          });
        });
      }
    }

    if (oldName !== name) {
      let newLogs = this.mainLogs[name];

      if (!newLogs) {
        newLogs = terminal.log;
      }

      this.setState({
        logs: newLogs,
        showClear: !!newLogs
      });
      
    }
  }

  componentWillUnmount() {
    const { name, dispatch, type } = this.props;
    this.unMount = true;
    dispatch({
      type: 'task/addLog',
      payload: {
        logs: this.mainLogs,
        type,
      }
    });
  }

  writeData(data, wname) {
    const { name, dispatch, type } = this.props;
    const str = ansiHTML(data.toString().replace(/\n/g, '<br>'));
    if (!this.unMount) {
      if (name === wname) {
        const { logs } = this.state;
        const newLogs = (logs || '') + str;
        this.mainLogs[wname] = newLogs;
        this.setState({
          logs: newLogs,
          showClear: true
        });
      } else {
        const newLogs = this.mainLogs[wname] + str;
        this.mainLogs[wname] = newLogs;
      }
    } else {
      dispatch({
        type: 'task/addLog',
        payload: {
          logs: this.mainLogs,
          type,
        }
      });
    }
  }

  clearTerm() {
    const { name, type, dispatch } = this.props;
    this.setState({
      logs: '',
      showClear: false
    });

    this.mainLogs[name] = '';

    dispatch({
      type: 'task/clearLog',
      payload: {
        name,
        type
      }
    });
  }

  render() {
    const { showClear, logs } = this.state;
    return (
      <div className="terminal-wrap">
        <div className="term-container" dangerouslySetInnerHTML={{ __html: logs }} />
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
  terminal: PropTypes.object,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default Terminal;
