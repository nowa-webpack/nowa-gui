import React, { Component, PropTypes } from 'react';
import { remote, shell, ipcRenderer } from 'electron';
import Dropzone from 'react-dropzone';
import { connect } from 'dva';
import Layout from 'antd/lib/layout';
import { info, confirm } from 'antd/lib/modal';
import semver from 'semver';
import classNames from 'classnames';
// import { hashHistory } from 'react-router';

import i18n from 'i18n';
import { hidePathString } from 'gui-util';
import { IS_WIN, UPGRADE_URL } from 'gui-const';
import { getLocalUpdateFlag, setLocalUpdateFlag, getLocalLanguage } from 'gui-local';
import request from 'gui-request';

import DragPage from './DragPage';

const { Header } = Layout;
const { windowManager } = remote.getGlobal('services');
const { registry } = remote.getGlobal('config');


class LayoutWrap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      online: props.online,
    };
    this.onDrop = this.onDrop.bind(this);
    this.getUpdateVersion = this.getUpdateVersion.bind(this);
  }

  componentDidMount() {

    const { dispatch, online } = this.props;
    
    if (online) {
      this.getUpdateVersion();
    }

    const alertOnlineStatus = () => {
      const newOnline = navigator.onLine;
      console.log(newOnline ? 'online' : 'offline');

      dispatch({
        type: 'layout/changeStatus',
        payload: { online: newOnline }
      });

      if (newOnline !== online && newOnline) {
        dispatch({
          type: 'init/fetchOnlineTemplates',
        });
      }

      ipcRenderer.send('network-change-status', newOnline);
    };

    window.addEventListener('online', alertOnlineStatus);
    window.addEventListener('offline', alertOnlineStatus);
  }

  componentWillReceiveProps({ newVersion, online }) {
    if (newVersion !== this.props.newVersion) {
      confirm({
        title: i18n('msg.updateConfirm'),
        content: (
          <div>
            <p>{i18n('msg.curVersion')} {this.props.newVersion}</p>
            <p>{i18n('msg.nextVersion')} {newVersion}</p>
          </div>),
        onOk() {
          shell.openExternal(UPGRADE_URL);
        },
        onCancel() {},
        okText: i18n('form.ok'),
        cancelText: i18n('form.cancel'),
      });
    }

    if (online !== this.props.online) {
      if (online) {
        this.getUpdateVersion();
      }
      this.setState({ online });
    }
  }

  getUpdateVersion() {
    const { dispatch, version } = this.props;
    // request('https://registry.npm.taobao.org/nowa-gui-version/latest')
    request(`${registry()}/nowa-gui-version/latest`)
      .then(({ data }) => {
        const newVersion = data.version;
        console.log('newVersion', newVersion);

        if (semver.lt(version, newVersion)) {
          dispatch({
            type: 'layout/changeStatus',
            payload: { newVersion }
          });
        }

        if (+getLocalUpdateFlag() !== 1) {
          const arr = data.readme.split('#').filter(i => !!i).map(i => i.split('*').slice(1));

          const tip = getLocalLanguage() === 'zh' ? arr[0] : arr[1];

          info({
            title: i18n('msg.updateTip'),
            content: (
              <ul className="update-tip">
                {tip.map(item => <li key={item}>{item}</li>)}
              </ul>),
            onOk() {
              setLocalUpdateFlag();
            },
            okText: i18n('form.ok'),
          });
        }
      });
  }

  onDrop(acceptedFiles) {
    const { dispatch } = this.props;

    dispatch({
      type: 'project/importProj',
      payload: { filePath: acceptedFiles[0].path, needInstall: true }
    });
    this.onDragLeave();
  }

  onDragOver() {
    document.getElementById('main-ctn').style.display = 'none';
    document.getElementById('drag-ctn').style.display = '';
  }

  onDragLeave() {
    document.getElementById('main-ctn').style.display = '';
    document.getElementById('drag-ctn').style.display = 'none';
  }

  render() {
    const { showPage, dispatch, version, current, children } = this.props;
    const { online } = this.state;
    const closeBtn = (
      <div className="icn icn-x" key="0" onClick={() => windowManager.close()}>
        <i className="iconfont icon-x" />
      </div>
      );
    const minimizeBtn = (
      <div className="icn icn-min" key="1" onClick={() => windowManager.minimize()}>
        <i className="iconfont icon-msnui-minimize" />
      </div>
      );
    const maximizeBtn = (
      <div className="icn icn-max" key="2">
        <i className="iconfont icon-msnui-maximize" />
      </div>
      );

    return (
      <Dropzone className="container"
        onDrop={this.onDrop}
        onDragOver={this.onDragOver}
        onDragLeave={this.onDragLeave}
        onClick={e => e.preventDefault()}
      >
        <Layout id="main-ctn">
          <Header className="top-bar">

            { showPage > 0 && <div className="bar-bd" /> }

            <div className={classNames({
                wifi: true,
                online: online
              })}><i className="iconfont icon-wifi" />
            </div>

            <div className="logo" onClick={() => shell.openExternal('https://nowa-webpack.github.io/')} />

            { showPage === 2 && <div className="proj-path">
              {current.name}
              <span>({hidePathString((current.path || ''))})</span>
            </div>}

            <div className="app-opt">
              { IS_WIN ? [closeBtn, maximizeBtn, minimizeBtn] : [closeBtn, minimizeBtn, maximizeBtn]}
            </div>
          </Header>
          { children }
        </Layout>
        <DragPage />
      </Dropzone>
    );
  }
}

LayoutWrap.propTypes = {
  version: PropTypes.string.isRequired,
  newVersion: PropTypes.string.isRequired,
  showPage: PropTypes.number.isRequired,
  current: PropTypes.shape({
    name: PropTypes.string,
    path: PropTypes.string
  }).isRequired,
  online: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect(({ layout, project }) => ({
  showPage: layout.showPage,
  newVersion: layout.newVersion,
  version: layout.version,
  current: project.current,
  online: layout.online,
}))(LayoutWrap);
