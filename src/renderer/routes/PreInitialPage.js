import React, { Component, PropTypes } from 'react';
// import { hashHistory } from 'react-router';
import { remote, ipcRenderer } from 'electron';
import Progress from 'antd/lib/progress';

import i18n from 'i18n';
import { getLocalProjects } from 'gui-local';


class PreInitialPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      seconds: 5,
      percent: 0,
      nowaPreFlag: props.nowaPreFlag,
    };
    this.shutdownTimer;
    this.afterInstalled = this.afterInstalled.bind(this);
    this.onReceiveNowaFlag = this.onReceiveNowaFlag.bind(this);
  }
  componentDidMount() {
    console.log('PreInitialPage componentDidMount');

    if (this.props.nowaPreFlag !== -2) {
      this.onReceiveNowaFlag(this.props.nowaPreFlag);
    }

    ipcRenderer.on('nowa-installing', this.onReceivePercent.bind(this));
    ipcRenderer.on('nowa-installed', this.afterInstalled.bind(this));
  }

  componentWillReceiveProps({ nowaPreFlag }) {
    if (nowaPreFlag !== this.props.nowaPreFlag && nowaPreFlag !== -2) {
      this.onReceiveNowaFlag(nowaPreFlag);
    }
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('nowa-installing');
    ipcRenderer.removeAllListeners('nowa-installed');
  }

  onReceiveNowaFlag(nowaPreFlag) {
    console.log('nowaNeedInstalled', nowaPreFlag);
    const loading = document.getElementById('loading');

    if (loading) document.body.removeChild(loading);

    if (nowaPreFlag === 0) {
      this.shutdownTimer = setInterval(() => {
        const { seconds } = this.state;
        if (seconds === 1) {
          clearInterval(this.shutdownTimer);
          remote.app.quit();
        } else {
          this.setState({ seconds: seconds - 1, nowaPreFlag: 0 });
        }
      }, 1000);
    } else if (nowaPreFlag === 2) {
      this.afterInstalled();
    } else {
      this.setState({ nowaPreFlag });
    }
  }

  onReceivePercent(event, { percent }) {
    this.setState({
      percent,
      // log,
    });
  }

  afterInstalled() {
    const { dispatch } = this.props;
    const { nowaPreFlag } = this.state;
    // this.removeLoading();
    const proj = getLocalProjects();
    let showPage = 0;
    
    if (nowaPreFlag === 1) {
      showPage = 3;
    } else {
      showPage = proj.length > 0 ? 2 : 0;
    }

    dispatch({
      type: 'layout/changeStatus',
      payload: { showPage }
    });

    dispatch({
      type: 'project/changeStatus',
      payload: { startWacthProject: true }
    });
  }

  render() {
    const { seconds, nowaPreFlag, percent } = this.state;
    let mainbody;

    if (nowaPreFlag === 0) {
      mainbody = (
        <div className="no-net">
          <p>{i18n('preinit.msg1')}</p>
          <p>{i18n('preinit.msg2', seconds)}</p>
        </div>
      );
    } else if (nowaPreFlag === 1) {
      mainbody = (
        <div>
          <Progress type="circle"
            percent={+percent} width={100}
            status={+percent === 100 ? 'success' : 'active'}
          />
          <div className="wait-install">{i18n('preinit.waitInstall')}</div>
        </div>
      );
    }

    return (
      <div className="preinit">
        { mainbody }
      </div>
    );
  }
}


PreInitialPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  nowaPreFlag: PropTypes.number.isRequired,
};

export default PreInitialPage;