import React, { Component, PropTypes } from 'react';
import { ipcRenderer, remote } from 'electron';
import Button from 'antd/lib/button';
// import Message from 'antd/lib/message';
import Progress from 'antd/lib/progress';
import Icon from 'antd/lib/icon';
import i18n from 'i18n';

const task = remote.require('./services/task');


class ImportLog extends Component {

  constructor(props) {
    super(props);
    this.state = {
      log: '',
      err: false,
      percent: 0,
      // expand: true,
    };

  }

  componentDidMount() {
    ipcRenderer.on('import-installing', this.onReceiveLog.bind(this));
    // ipcRenderer.on('import-installed', this.onReceiveFinished.bind(this));
  }

  componentWillReceiveProps({ filePath }) {
    if (filePath !== this.props.filePath) {
      const { log } = task.getTask('IMPORT_PROJECT', name);
      if (log.length > 0) {
        this.setState({ log }, () => this.scrollToBottom());
      } else {
        this.setState({ log: '' });
      }
    }
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('import-installing');
    // ipcRenderer.removeAllListeners('import-installed');
  }

  onReceiveLog(event, { percent, log }) {
    this.setState({
      percent,
      log,
    }, () => this.scrollToBottom());
  }

  // onReceiveFinished(event, { err }) {
  //   console.log('finished');
  //   if (err) {
  //     Message.error(i18n('msg.installFail'));
  //     this.setState({
  //       err
  //     });
  //   } else {
  //     /*this.props.dispatch({
  //       type: 'project/finishedInstallDependencies',
  //       payload: { filePath: this.props.filePath }
  //     });*/
  //   }
  // }

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
    const { dispatch, filePath } = this.props;
    this.clearTerm();
    // dispatch({
    //   type: 'project/importProj',
    //   payload: {
    //     filePath, needInstall: true
    //   }
    // });
  }

  render() {
    const { err, percent, log } = this.state;

    const detailHtml = err 
      ? (<div className="detail">{i18n('project.new.log.error')}<br />
            <Button type="primary" onClick={() => this.retryInstall()}>
              {i18n('project.new.log.retry')}
            </Button>
          </div>)
      : (<div className="detail">{i18n('project.new.log.wait')}</div>);

    return (
      <div className="progress-wrap" >
        <Progress type="circle"
          percent={+percent} width={100}
          status={err ? 'exception' : +percent === 100 ? 'success' : 'active'}
        />
        { detailHtml }
        <div className="terminal-wrap" >
          <div className="term-container" ref="wrap"
            style={{ height: 170 }}
          >
            <div dangerouslySetInnerHTML={{ __html: log }} ref="term" />
          </div>
          <Icon type="arrows-alt" className="clear-btn" onClick={() => this.setState({ expand: !expand })} />
        </div>
      </div>
    );
  }
}

ImportLog.propTypes = {
  filePath: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default ImportLog;
