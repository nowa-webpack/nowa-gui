/*
  初始化页面
*/
import React, { Component, PropTypes } from 'react';
import { remote, ipcRenderer } from 'electron';
import Progress from 'antd/lib/progress';
import { connect } from 'dva';

import i18n from 'i18n-renderer-nowa';
import { removeLoading } from 'util-renderer-nowa';


const { nowa } = remote.getGlobal('services');

class PreinitPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      percent: 0,
      success: true,
      errmsg: '',
      visibility: 'hidden',
    };
    this.timer = null;
    this.installFinished = this.installFinished.bind(this);
    this.installFailed = this.installFailed.bind(this);
    this.installProgress = this.installProgress.bind(this);
  }

  async componentDidMount() {
    // 判断有无更新的nowa组件
    await nowa.checkNeedInstallPkgs();
    const needInstall = nowa.needInstall();

    removeLoading();

    // 不需要更新nowa组件，直接跳转页面
    if (!needInstall) {
      this.installFinished();
    } else {
      ipcRenderer.on('nowa-install-progress', this.installProgress);
      ipcRenderer.on('nowa-install-failed', this.installFailed);
      ipcRenderer.on('nowa-install-finished', this.installFinished);
      nowa.installNowaPkgs();
      this.setState({ visibility: 'visible', percent: 1 });
    }

    // this.timer = setInterval(() => {
    //   const { percent } = this.state;
    //   if (percent < 100) {
    //     this.setState({ percent: percent + 1 });
    //   } else {
    //     clearInterval(this.timer);
    //   }
    // }, 1000);
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('nowa-install-progress');
    ipcRenderer.removeAllListeners('nowa-install-failed');
    ipcRenderer.removeAllListeners('nowa-install-finished');

    clearInterval(this.timer);
  }

  installProgress(event, percent) {
    if (percent) {
      // if (percent === 100) {
        // const { dispatch } = this.props;
        // setTimeout(() => dispatch({ type: 'layout/afterInit', }), 1000);
      // }
      this.setState({ percent: +percent });
    }
  }

  installFailed(event, errmsg) {
    if (errmsg) {
      clearInterval(this.timer);
      // this.setState({ success: false, errmsg: errmsg.replace(/(\r\n|\n)/g, ' ') });
      this.setState({
        success: false, errmsg: errmsg.replace(/(\r\n|\n)/g, ' ')
      });
    }
  }

  // 安装结束后通知 layout 走下面的流程，比如请求模板
  installFinished() {
    const { dispatch } = this.props;
    clearInterval(this.timer);
    this.setState({
      percent: 100
    }, () => dispatch({ type: 'layout/afterInit' }));
  }

  render() {
    const { percent, errmsg, success, visibility } = this.state;
    let status = 'active';

    if (!success) {
      status = 'exception';
    } else if (percent === 100) {
      status = 'success';
    }

    return (
      <div className="preinit" style={{ visibility }}>
        <div className="preinit-content">
          <Progress type="circle"
            percent={percent}
            width={100}
            status={status}
          />
          <div className="preinit-detail">
            { success ? i18n('preinit.waitInstall') : i18n('project.new.log.error')}
          </div>
          <p className="preinit-err">{errmsg}</p>
        </div>
      </div>
    );
  }
}

PreinitPage.propTypes = {
  showPage: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect(({ layout }) => ({
  showPage: layout.showPage,
}))(PreinitPage);
