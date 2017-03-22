import React, { Component, PropTypes } from 'react';
import Button from 'antd/lib/button';
import Message from 'antd/lib/message';
import Progress from 'antd/lib/progress';
import Icon from 'antd/lib/icon';
import ansiHTML from 'ansi-html';
import i18n from 'i18n';


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
  }

  componentDidMount() {
    const { term } = this.props;

    this.termBind(term);
  }

  componentWillReceiveProps(next) {
    const { term } = next;
    if (!this.props.term || term.pid !== this.props.term.pid) {
      this.termBind(term);
    }
  }

  getProcess(str) {
    const position = [str.indexOf('['), str.indexOf(']')];
    // console.log(position);
    if (position.filter(p => p !== -1).length === 2) {
      const num = str.slice(position[0] + 1, position[1]).split('/');

      let newProgress = this.state.progress;

      if (num.length === 2 && !this.state.err) {
        newProgress = (num[0] / num[1] * 100).toFixed(0);
      }
      return newProgress;
    }
    return 99;
  }

  scrollToBottom() {
    const prt = this.refs.wrap;
    const ele = this.refs.term;
    if (ele.offsetHeight > prt.clientHeight) {
      prt.scrollTop = ele.clientHeight - prt.clientHeight;
    }
  }

  termBind(term) {
    const { dispatch } = this.props;
    term.stdout.on('data', (data) => {
      const str = data.toString();

      this.setState({
        logs: newLog(this.state.logs, str),
        progress: this.getProcess(str),
      }, () => this.scrollToBottom());

    });

    term.stderr.on('data', (data) => {
      this.setState({
        logs: newLog(this.state.logs, data.toString()),
      }, () => this.scrollToBottom());
    });
    
    term.on('exit', (code) => {
      if (code) {
        Message.error(i18n('msg.installFail'));
        this.setState({ err: true });
      } else {
        // Message.success(i18n('msg.installSuccess'));
        dispatch({
          type: 'init/finishedInstall',
        });
      }
    });
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
      (<div className="detail">{i18n('project.new.log.error')}<br />
        <Button type="primary" onClick={() => this.retryInstall()}>{i18n('project.new.log.retry')}</Button>
        <Button type="default" onClick={() => prev()}>{i18n('form.back')}</Button>
      </div>) : (<div className="detail">{i18n('project.new.log.wait')}</div>);
    return (
      <div className="progress-wrap" >
        <Progress type="circle"
          percent={+progress} width={100}
          status={err ? 'exception' : +progress === 100 ? 'success' : 'active'}
        />
        { detailHtml }
        <div className="terminal-wrap" >
          <div className="term-container" ref="wrap"
            style={{ height: expand ? 170 : 90 }}
          >
            <div dangerouslySetInnerHTML={{ __html: logs }} ref="term" />
          </div>
          <Icon type="arrows-alt" className="clear-btn" onClick={() => this.setState({ expand: !expand })} />
        </div>
      </div>
    );
  }
}

Log.propTypes = {
  term: PropTypes.object,
  prev: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default Log;


