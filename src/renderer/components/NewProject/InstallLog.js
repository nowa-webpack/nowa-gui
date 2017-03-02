import React, {Component} from 'react';
import Layout from 'antd/lib/layout';
import Button from 'antd/lib/button';
import Message from 'antd/lib/message';
import Progress from 'antd/lib/progress';
import Icon from 'antd/lib/icon';
import i18n from 'i18n';
import ansiHTML from 'ansi-html';
// import chalk from 'chalk';

const { Header, Content } = Layout;

// ansiHTML.setColors({
//   // reset: ['555', '666'], // FOREGROUND-COLOR or [FOREGROUND-COLOR] or [, BACKGROUND-COLOR] or [FOREGROUND-COLOR, BACKGROUND-COLOR]
//   black: '000', // String
//   red: 'f98677',
//   green: '79cc66',
//   yellow: 'efe594',
//   blue: '8ec4ec',
//   magenta: 'ff96fa',
//   cyan: '969cff',
//   lightgrey: 'f98677',
//   darkgrey: '444'
// });

const newLog = (oldLog, str) => oldLog + (ansiHTML(str) + '<br>');

class Log extends Component {

  constructor(props) {
    super(props);
    this.state = {
      logs: '',
      err: false,
      progress: 0,
      expand: false
    };
    // this.exit = this.exit.bind(this);
  }

  componentDidMount() {
    const { term, dispatch } = this.props;

    term.stdout.on('data', (data) => {
      const str = data.toString();

      this.setState({
        logs: newLog(this.state.logs, str),
        progress: this.getProcess(str),
      });
    });

    term.stderr.on('data', (data) => {
      this.setState({
        logs: newLog(this.state.logs, data.toString()),
      });
    });

    term.on('exit', (code) => {
      if (code) {
        Message.error('Installed Failed!');
        this.setState({ err: true });
      } else {
        Message.success('Installed Success!');
        dispatch({
          type: 'init/finishedInstall',
        });
      }
    });
  }

  componentWillReceiveProps(next) {
    const { term, dispatch } = next;
    if (!this.props.term || term.pid !== this.props.term.pid) {
      
      term.stdout.on('data', (data) => {
        const str = data.toString();

        this.setState({
          logs: newLog(this.state.logs, str),
          progress: this.getProcess(str),
        });

      });

      term.stderr.on('data', (data) => {
        this.setState({
          logs: newLog(this.state.logs, data.toString()),
        });
      });
      
      term.on('exit', (code) => {
        if (code) {
          Message.error('Installed Failed!');
          this.setState({ err: true });
        } else {
          Message.success('Installed Success!');
          dispatch({
            type: 'init/finishedInstall',
          });
        }
      });
    }
  }

  getProcess(str) {
    const position = [str.indexOf('['), str.indexOf(']')];

    const num = str.slice(position[0] + 1, position[1]).split('/');

    let newProgress = this.state.progress;

    if (num.length === 2 && !this.state.err) {
      newProgress = (num[0] / num[1] * 100).toFixed(0);
    }

    return newProgress;
  }

  clearTerm() {
    this.setState({
      logs: '',
      err: false,
      progress: 0,
    });
  }

  retryInstall() {
    const { dispatch } = this.props;
    this.clearTerm();
    dispatch({
      type: 'init/retryInstall',
    });
  }

  render() {
    const { err, progress, expand, logs } = this.state;
    const { prev } = this.props;

    const detailHtml = err ?
      <div className="detail">安装过程中出现错误, 如有需要请查看下方日志或返回重试<br />
        <Button type="primary" onClick={() => this.retryInstall()}>Retry</Button>
        <Button type="default" onClick={() => prev()}>Back</Button>
      </div> : <div className="detail">依赖安装中 请耐心等待</div>;
    return (
      <div className="progress-wrap" >
        <Progress type="circle" 
          percent={+progress} width={100}
          status={err ? 'exception' : +progress === 100 ? 'success' : 'active'}
        />
        { detailHtml }
        <div className="terminal-wrap" >
          <div className="term-container"
            dangerouslySetInnerHTML={{ __html: logs }}
            style={{ height: expand ? 170 : 90 }}
          />
          <Icon type="arrows-alt" className="clear-btn" onClick={() => this.setState({ expand: !expand })} />
        </div>
      </div>
    );
  }

}

export default Log;
