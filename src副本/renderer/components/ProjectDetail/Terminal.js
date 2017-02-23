import React, { Component, PropTypes } from 'react';
// import { connect } from 'dva';
import Button from 'antd/lib/button';
import ansiHTML from 'ansi-html';

ansiHTML.setColors({
  // reset: ['555', '666'], // FOREGROUND-COLOR or [FOREGROUND-COLOR] or [, BACKGROUND-COLOR] or [FOREGROUND-COLOR, BACKGROUND-COLOR]
  black: '000', // String
  red: 'f98677',
  green: '79cc66',
  yellow: 'efe594',
  blue: '8ec4ec',
  magenta: 'ff96fa',
  cyan: '969cff',
  // lightgrey: 'bbb',
  lightgrey: 'f98677',
  darkgrey: '000'
});


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
      console.log('componentDidMount');
      term.stdout.on('data', (data) => {
        this.writeData(data, name);
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
    // const { logs, showClear } = this.state;

    if (!oldTerm && term) {
      console.log('componentWillReceiveProps');
      if (oldName === name) {
        term.stdout.on('data', (data) => {
          this.writeData(data, name);
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
      const newLogs = logs + ansiHTML(data.toString().replace(/\n/g, '<br>'));
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
          showClear && <Button type="ghost" size="small" onClick={() => this.clearTerm()}>
            <i className="iconfont icon-eraser" />
          </Button>
        }
      </div>
    );
  }
}

Terminal.propTypes = {
  term: PropTypes.object,
  name: PropTypes.string,
  type: PropTypes.string,
  dispatch: PropTypes.func,
};

export default Terminal;

// export default connect(({ task, project  }) => ({ 
//   name: project.current.path, 
//   term: task.build[project.current.path]
// }))(Terminal);

