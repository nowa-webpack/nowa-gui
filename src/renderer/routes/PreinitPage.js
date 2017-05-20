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
    this.installFinished = this.installFinished.bind(this);
  }

  async componentDidMount() {
    await nowa.checkNeedInstallPkgs();
    const needInstall = nowa.needInstall();

    removeLoading();

    // 不需要更新nowa组件，直接跳转页面
    if (!needInstall) {
      this.installFinished();
    } else {
      ipcRenderer.on('nowa-install-progress', this.getNewPercent.bind(this));
      ipcRenderer.on('nowa-install-failed', this.installFailed.bind(this));
      ipcRenderer.on('nowa-install-finished', this.installFinished);
      nowa.installNowaPkgs();
      this.setState({ visibility: 'visible', percent: 1 });
    }
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('nowa-install-progress');
    ipcRenderer.removeAllListeners('nowa-install-failed');
    ipcRenderer.removeAllListeners('nowa-install-finished');
  }

  getNewPercent(event, percent) {
    if (percent) {
      // if (percent === 100) {
      //   const { dispatch } = this.props;
      //   setTimeout(() => dispatch({ type: 'layout/afterInit', }), 1000);
      //   ;
      // }
      this.setState({ percent: +percent });
    }
  }

  installFailed(event, errmsg) {
    this.setState({ success: false, errmsg });
  }

  installFinished() {
    const { dispatch } = this.props;
    dispatch({ type: 'layout/afterInit' });
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