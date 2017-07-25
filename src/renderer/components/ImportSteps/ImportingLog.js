import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import ansiHTML from 'ansi-html';
import Icon from 'antd/lib/icon';
import Button from 'antd/lib/button';
import { Content } from 'antd/lib/layout';
import Progress from 'antd/lib/progress';
import { ipcRenderer } from 'electron';

import i18n from 'i18n-renderer-nowa';

class Log extends Component {

  constructor(props) {
    super(props);
    this.state = {
      log: '',
      errmsg: '',
      percent: 0,
      expanded: false,
    };
    this.timer = null;
    this.onReceiveLog = this.onReceiveLog.bind(this);
    // this.onReceiveProgress = this.onReceiveProgress.bind(this);
    this.onReceiveFailed = this.onReceiveFailed.bind(this);
  }

  componentDidMount() {
    ipcRenderer.on('import-logging', this.onReceiveLog);
    // ipcRenderer.on('import-progress', this.onReceiveProgress);
    ipcRenderer.on('import-failed', this.onReceiveFailed);
    this.timer = setInterval(() => {
      const { percent } = this.state;
      if (percent < 100) {
        this.setState({ percent: percent + 1 });
      } else {
        clearInterval(this.timer);
      }
    }, 1000);
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('import-logging');
    // ipcRenderer.removeAllListeners('import-progress');
    ipcRenderer.removeAllListeners('import-failed');
    clearInterval(this.timer);
  }

  onReceiveLog(event, log) {
    this.setState({
      // log: ansiHTML(log.join('<br>'))
      log: ansiHTML(log)
    }, () => this.scrollToBottom());
  }

  // onReceiveProgress(event, percent) {
  //   console.log(percent);
  //   this.setState({ percent });
  // }

  onReceiveFailed(event, errmsg) {
    clearInterval(this.timer);
    this.setState({ errmsg });
  }

  scrollToBottom() {
    const prt = this.refs.wrap;
    const ele = this.refs.terminal;
    if (ele.offsetHeight > prt.clientHeight) {
      prt.scrollTop = ele.clientHeight - prt.clientHeight;
    }
  }

  retryInstall() {
    this.clearTerm();

    this.props.dispatch({
      type: 'projectCreate/startInstallModules',
      payload: { isRetry: true }
    });
  }

  clearTerm() {
    this.setState({
      log: '',
      errmsg: '',
      percent: 0,
    });
  }

  goBack() {
    this.props.dispatch({
      type: 'layout/goBack'
    });
  }

  render() {
    const { errmsg, percent, expanded, log } = this.state;

    let status = 'active';

    if (errmsg) {
      status = 'exception';
    } else if (percent === 100) {
      status = 'success';
    }

    const detailHtml = errmsg
      ? (<div className="importing-detail">
          <span className="importing-detail-err">{i18n('project.new.log.error')}</span>
          <div className="importing-detail-btns">
            <Button
              ghost
              type="danger"
              onClick={() => this.retryInstall()}
            >
              {i18n('project.new.log.retry')}
            </Button>
            <Button type="default" onClick={() => this.goBack()}>{i18n('form.back')}</Button>
          </div>
        </div>)
      : (<div className="importing-detail">{i18n('project.new.log.wait')}</div>);

    return (
      <Content className="importing" >
        <Progress type="circle"
          percent={+percent}
          width={100}
          status={status}
        />
        { detailHtml }
        <div className="importing-content" >
          <div
            className="importing-content-term"
            ref="wrap"
            style={{ height: expanded ? 200 : 100 }}
          >
            <div dangerouslySetInnerHTML={{ __html: log }} ref="terminal" />
          </div>
          <Icon
            type={expanded ? 'shrink' : 'arrows-alt'}
            className="importing-content-clear"
            onClick={() => this.setState({ expanded: !expanded })}
          />
        </div>
      </Content>
    );
  }
}

Log.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default connect()(Log);
