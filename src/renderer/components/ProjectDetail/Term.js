import React, { Component, PropTypes } from 'react';
import ansiHTML from 'ansi-html';
import Button from 'antd/lib/button';


class Terminal extends Component {
  constructor(props) {
    super(props);
    this.mainLogs = {};
    this.state = {
      showClear: false,
      logs: ''
    };
  }

  componentDidMount() {
    const { term, name, dispatch, type } = this.props;

    if (term) {
      term.stdout.on('data', (data) => {
        this.writeData(data, name);
      });

      term.stderr.on('data', (data) => {
        this.writeData(data, name);
        dispatch({
          type: 'project/taskErr',
          payload: {
            type: 'build',
            filePath: name
          }
        });
      });

      term.on('exit', () => {
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

  componentWillReceiveProps({ term, name, dispatch, type }) {
    const { term: oldTerm, name: oldName } = this.props;

    if (!oldTerm && term) {
      if (oldName === name) {
        term.stdout.on('data', (data) => {
          this.writeData(data, name);
        });

        term.stderr.on('data', (data) => {
          this.writeData(data, name);
          dispatch({
            type: 'project/taskErr',
            payload: {
              type,
              filePath: name
            }
          });
        });

        term.on('exit', () => {
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
      const newLogs = this.mainLogs[name];
      this.setState({
        logs: newLogs,
        showClear: newLogs && newLogs.length
      });
    }
  }

  writeData(data, wname) {
    const { name } = this.props;
    if (name === wname) {
      const { logs } = this.state;
      const newLogs = (logs || '' ) + ansiHTML(data.toString().replace(/\n/g, '<br>'));
      this.mainLogs[wname] = newLogs;
      this.setState({
        logs: newLogs,
        showClear: true
      });
    } else {
      const newLogs = this.mainLogs[wname] + ansiHTML(data.toString().replace(/\n/g, '<br>'));
      this.mainLogs[wname] = newLogs;
    }
  }

  clearTerm() {
    this.setState({
      logs: '',
      showClear: false
    });

    this.mainLogs[this.props.name] = '';
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
  term: PropTypes.object,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default Terminal;
