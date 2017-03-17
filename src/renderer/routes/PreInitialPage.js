import React, { Component, PropTypes } from 'react';
import { hashHistory } from 'react-router';
import { remote, ipcRenderer } from 'electron';
// import Layout from 'antd/lib/layout';
import { getLocalProjects } from 'gui-local';
// const { Header } = Layout;

const { nowaNeedInstalled } = remote.getGlobal('config');
// const { windowManager } = remote.getGlobal('services');


class PreInitialPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      seconds: 5,
      closeFlag: !props.online && nowaNeedInstalled(),
    };
    this.afterInstalled = this.afterInstalled.bind(this);
    this.shutdownTimer;
    this.taskTimer;
  }
  componentDidMount() {
    console.log('in PreInitialPage', 'nowaNeedInstalled',nowaNeedInstalled());
    console.log('closeFlag', this.state.closeFlag);

    if (this.state.closeFlag) {
      this.removeLoading();
      this.shutdownTimer = setInterval(() => {
        const { seconds } = this.state;
        if (seconds === 1) {
          clearInterval(this.shutdownTimer);
          remote.app.quit();
        } else {
          this.setState({ seconds: seconds - 1 });
        }
      }, 1000);
    } else if (!nowaNeedInstalled()) {
      this.afterInstalled();
    }

    ipcRenderer.on('nowa-installed', () => {
      this.afterInstalled();
    });
  }

  removeLoading() {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
      document.body.removeChild(loadingDiv);
    }
  }

  afterInstalled() {
    const { dispatch } = this.props;
    this.removeLoading();
    const proj = getLocalProjects();
    this.props.dispatch({
      type: 'layout/changeStatus',
      payload: { showPage: proj.length > 0 ? 2 : 0 }
    });

    if (!this.taskTimer) {
      this.taskTimer = setInterval(() => {
        dispatch({
          type: 'project/watchProjects',
        });
      }, 5000);
    }
  }

  render() {
    const { seconds, closeFlag } = this.state;
    let mainbody;

    if (closeFlag) {
      mainbody = (
        <div className="no-net">
          <p>初始化的时候必须要连接网络，请联网后重新打开应用</p>
          <p>{seconds} 后自动关闭应用</p>
        </div>);
    } else if (nowaNeedInstalled()) {
      mainbody = <div className="wait-install">正在安装需要的依赖更新，大约需要半分钟时间，请耐心等待。</div>
    }

    return (
      <div className="preinit">
        { mainbody }
      </div>
    );
  }
}

export default PreInitialPage;