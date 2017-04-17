import React, { Component, PropTypes } from 'react';
import { remote, shell } from 'electron';
import Dropzone from 'react-dropzone';
import { connect } from 'dva';
import semver from 'semver';
import Layout from 'antd/lib/layout';
import { info, confirm } from 'antd/lib/modal';
// import { hashHistory } from 'react-router';

import i18n from 'i18n';
import { hidePathString, readPkgJson, getPkgDependencies } from 'gui-util';
import { IS_WIN, UPGRADE_URL } from 'gui-const';
import { getLocalUpdateFlag, setLocalUpdateFlag, getLocalLanguage } from 'gui-local';
import request from 'gui-request';

import DragPage from './DragPage';


const { Header } = Layout;
const { windowManager, command, utils } = remote.getGlobal('services');
// const { registry } = remote.getGlobal('config');


class LayoutWrap extends Component {
  constructor(props) {
    super(props);
    // this.state = {
      // online: props.online,
    // };
    this.taskTimer;
    this.onDrop = this.onDrop.bind(this);
    this.getUpdateVersion = this.getUpdateVersion.bind(this);
  }

  componentDidMount() {
    const { dispatch, startWacthProject, online } = this.props;
    console.log('LayoutWrap componentDidMount');
    
    if (online) {
      this.getUpdateVersion();
    }

    if (startWacthProject) {
      this.taskTimer = setInterval(() => {
        dispatch({
          type: 'project/refresh',
        });
      }, 5000);
    }
  }

  componentWillReceiveProps({ newVersion, online, startWacthProject, upgradeUrl, dispatch }) {
    if (newVersion !== this.props.newVersion) {
      confirm({
        title: i18n('msg.updateConfirm'),
        content: (
          <div>
            <p>{i18n('msg.curVersion')} {this.props.newVersion}</p>
            <p>{i18n('msg.nextVersion')} {newVersion}</p>
          </div>),
        onOk() {
          if (upgradeUrl) {
            shell.openExternal(upgradeUrl);
          } else {
            shell.openExternal(UPGRADE_URL);
          }
        },
        onCancel() {},
        okText: i18n('form.ok'),
        cancelText: i18n('form.cancel'),
      });
    }

    if (online !== this.props.online && online) {
      this.getUpdateVersion();
    }

    if (startWacthProject !== this.props.startWacthProject) {
      if (!startWacthProject) {
        clearInterval(this.taskTimer);
      } else {
        this.taskTimer = setInterval(() => {
          dispatch({
            type: 'project/refresh',
          });
        }, 5000);
      }
    }
  }

  onDrop(acceptedFiles) {
    const { dispatch, registry } = this.props;
    const filePath = acceptedFiles[0].path;

    const pkgs = getPkgDependencies(readPkgJson(filePath));

    const options = {
      root: filePath,
      registry,
      pkgs,
    };
    dispatch({
      type: 'project/importProj',
      payload: {
        filePath,
        needInstall: true
      }
    });
    command.notProgressInstall({
      options,
      sender: 'import',
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

  getUpdateVersion() {
    const { dispatch, version, registry } = this.props;
    request(`${registry}/nowa-gui-version`)
    // request('https://registry.npm.taobao.org/nowa-gui-version')
      .then(({ data }) => {
        const newVersion = data['dist-tags'].latest;
        console.log('newVersion', newVersion);

        if (data.download) {
          dispatch({
            type: 'layout/changeStatus',
            payload: { upgradeUrl: data.download[process.platform] }
          });
        }

        if (semver.lt(version, newVersion)) {
          dispatch({
            type: 'layout/changeStatus',
            payload: { newVersion }
          });
        }

        if (+getLocalUpdateFlag(version) !== 1) {
          console.log(data)
          const arr = data.readme.split('#').filter(i => !!i).map(i => i.split('*').slice(1));

          const tip = getLocalLanguage() === 'zh' ? arr[0] : arr[1];

          info({
            title: i18n('msg.updateTip'),
            content: (
              <ul className="update-tip">
                {tip.map(item => <li key={item}>{item}</li>)}
              </ul>),
            onOk() {
              setLocalUpdateFlag(version);
            },
            okText: i18n('form.ok'),
          });
        }
      });
  }

  render() {
    const { showPage, current, children } = this.props;
    // const { online } = this.state;
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

            <div className="logo" onClick={() => shell.openExternal('https://alixux.org/nowa/')} />

            { showPage === 2 &&
              <div className="proj-info">
                <span className="proj-info-name">{current.name}</span>
                <span className="proj-info-dir">({hidePathString((current.path || ''))})</span>
                { current.start ? <span className="proj-info-status start">{i18n('task.status.start')}</span>
                  : <span className="proj-info-status stop">{i18n('task.status.stop')}</span>}
              </div>
            }

            <div className="app-opt">
              { IS_WIN
                  ? [closeBtn, maximizeBtn, minimizeBtn]
                  : [closeBtn, minimizeBtn, maximizeBtn]}
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
  registry: PropTypes.string.isRequired,
  upgradeUrl: PropTypes.string.isRequired,
  startWacthProject: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default connect(({ layout, project }) => ({
  showPage: layout.showPage,
  newVersion: layout.newVersion,
  version: layout.version,
  current: project.current,
  online: layout.online,
  registry: layout.registry,
  startWacthProject: project.startWacthProject,
  upgradeUrl: layout.upgradeUrl
}))(LayoutWrap);
