import React, { Component, PropTypes } from 'react';
// import { hashHistory } from 'react-router';
import { remote, ipcRenderer } from 'electron';
import pubsub from 'electron-pubsub';
import Progress from 'antd/lib/progress';

import i18n from 'i18n';
import { getLocalProjects } from 'gui-local';

const { nowaNeedInstalled } = remote.getGlobal('config');


class PreInitialPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      seconds: 5,
      closeFlag: !props.online && nowaNeedInstalled(),
      log: '',
      percent: 0,
    };
    this.shutdownTimer;
    this.afterInstalled = this.afterInstalled.bind(this);
  }
  componentDidMount() {
    console.log('in PreInitialPage', 'nowaNeedInstalled', nowaNeedInstalled());
    // this.removeLoading();

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

    pubsub.subscribe('nowa-installing', this.onReceiveLog.bind(this));
    pubsub.subscribe('nowa-installed', this.afterInstalled.bind(this));

    // ipcRenderer.on('nowa-installed', () => {
    //   this.afterInstalled();
    // });
  }

  componentWillUnmount() {
    pubsub.unsubscribe('nowa-installing');
    pubsub.unsubscribe('nowa-installed');
  }

  onReceiveLog(event, { percent, log }) {
    this.setState({
      percent,
      log,
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
    // this.removeLoading();
    const proj = getLocalProjects();
    dispatch({
      type: 'layout/changeStatus',
      payload: { showPage: proj.length > 0 ? 2 : 0 }
    });

    dispatch({
      type: 'project/changeStatus',
      payload: { startWacthProject: true }
    });
  }

  render() {
    const { seconds, closeFlag, percent, log } = this.state;
    let mainbody;

    if (closeFlag) {
      mainbody = (
        <div className="no-net">
          <p>{i18n('preinit.msg1')}</p>
          <p>{i18n('preinit.msg2', seconds)}</p>
        </div>);
    } else if (nowaNeedInstalled()) {
      mainbody = (
        <div className="wait-install">{i18n('preinit.waitInstall')}</div>
      );
    }

    return (
      <div className="preinit">
        <Progress type="circle"
          percent={+percent} width={100}
          status={+percent === 100 ? 'success' : 'active'}
        />
        { <div className="wait-install">{i18n('preinit.waitInstall')}</div> }
      </div>
    );
  }
}

PreInitialPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  online: PropTypes.bool.isRequired,
};

export default PreInitialPage;