import React, { Component, PropTypes } from 'react';
import { ipcRenderer } from 'electron';
import Button from 'antd/lib/button';
import Message from 'antd/lib/message';
import Progress from 'antd/lib/progress';
import Icon from 'antd/lib/icon';
// import ansiHTML from 'ansi-html';
import i18n from 'i18n';


const newLog = (oldLog, str) => oldLog + (ansiHTML(str) + '<br>');

class Log extends Component {

  constructor(props) {
    super(props);
    this.state = {
      log: '',
      err: false,
      percent: 0,
      expand: false
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    ipcRenderer.on('install-modules', (event, { percent, finished, err, log }) => {
      if (finished) {
        if (err) {
          Message.error(i18n('msg.installFail'));
          this.setState({
            err
          });
        } else {
          dispatch({
            type: 'init/finishedInstall',
          });
        }
      } else {
        this.setState({
          percent,
          log,
        }, () => this.scrollToBottom());
      }
    });
  }

  scrollToBottom() {
    const prt = this.refs.wrap;
    const ele = this.refs.term;
    if (ele.offsetHeight > prt.clientHeight) {
      prt.scrollTop = ele.clientHeight - prt.clientHeight;
    }
  }

  clearTerm() {
    this.setState({
      logs: '',
      err: false,
      percent: 0,
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
    const { err, percent, expand, log } = this.state;
    const { prev } = this.props;

    const detailHtml = err ?
      (<div className="detail">{i18n('project.new.log.error')}<br />
        <Button type="primary" onClick={() => this.retryInstall()}>{i18n('project.new.log.retry')}</Button>
        <Button type="default" onClick={() => prev()}>{i18n('form.back')}</Button>
      </div>) : (<div className="detail">{i18n('project.new.log.wait')}</div>);

    return (
      <div className="progress-wrap" >
        <Progress type="circle"
          percent={+percent} width={100}
          status={err ? 'exception' : +percent === 100 ? 'success' : 'active'}
        />
        { detailHtml }
        <div className="terminal-wrap" >
          <div className="term-container" ref="wrap"
            style={{ height: expand ? 170 : 90 }}
          >
            <div dangerouslySetInnerHTML={{ __html: log }} ref="term" />
          </div>
          <Icon type="arrows-alt" className="clear-btn" onClick={() => this.setState({ expand: !expand })} />
        </div>
      </div>
    );
  }
}

Log.propTypes = {
  // term: PropTypes.object,
  prev: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default Log;


