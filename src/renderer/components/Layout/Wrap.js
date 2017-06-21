import React, { Component, PropTypes } from 'react';
import { remote } from 'electron';
import { connect } from 'dva';
import Spin from 'antd/lib/spin';
import Icon from 'antd/lib/icon';
import Layout from 'antd/lib/layout';
import Dropzone from 'react-dropzone';
import notification from 'antd/lib/notification';

import i18n from 'i18n-renderer-nowa';
import { isWin, throttle } from 'shared-nowa';
import { hidePathString, openUrl } from 'util-renderer-nowa';
import { BOILERPLATE_PAGE, PROJECT_PAGE, IMPORT_STEP1_PAGE, IMPORT_STEP2_PAGE } from 'const-renderer-nowa';
import DragPage from './DragPage';

const { Header } = Layout;
const { mainWin } = remote.getGlobal('services');


class LayoutWrap extends Component {
  constructor(props) {
    super(props);
    // this.state = {
    //   shouldAppUpdate: props.version !== props.newVersion,
    // };
    this.taskTimer = null;
    this.updateArgs = {
      key: 'update',
      message: i18n('msg.updateTitle'),
      duration: 0,
      placement: 'bottomRight',
      icon: <Icon type="download" style={{ color: '#108ee9' }} />,
    };
    this.onDrop = this.onDrop.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
  }

  componentDidMount() {
    const { startWacthProject, dispatch } = this.props;
    // if (startWacthProject) {
    //   this.taskTimer = setInterval(() => {
    //     dispatch({ type: 'project/refresh' });
    //   }, 10000);
    // }

    window.addEventListener('resize', throttle(this.onWindowResize, 500));
  }

  componentWillReceiveProps({ startWacthProject, dispatch, newVersion, version }) {
    if (startWacthProject !== this.props.startWacthProject) {
      if (!startWacthProject) {
        clearInterval(this.taskTimer);
      } else {
        this.taskTimer = setInterval(() => {
          dispatch({ type: 'project/refresh' });
        }, 10000);
      }
    }
    if (newVersion !== this.props.newVersion) {
      this.updateArgs.description = (
        <div>
          {i18n('msg.updateCnt1', newVersion, version)}&nbsp;
          <a onClick={() => {
            dispatch({ type: 'layout/updateAPP' });
            notification.close('update');
          }}>
            {i18n('msg.updateCnt2')}
          </a>
        </div>
      );
      notification.open(this.updateArgs);
    }
  }

  onWindowResize() {
    const windowHeight = document.body.clientHeight;
    this.props.dispatch({
      type: 'layout/changeStatus',
      payload: { windowHeight }
    });
  }

  onDrop(acceptedFiles) {
    const { dispatch } = this.props;
    const projPath = acceptedFiles[0].path;
    dispatch({
      type: 'projectCreate/folderImport',
      payload: {
        projPath,
      }
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
    const { showPage, current, children, loading } = this.props;
    const closeBtn = (
      <div className="top-bar-icn icn-x" key="0" onClick={() => mainWin.close()}>
        <i className="iconfont icon-x" />
      </div>
    );
    const minimizeBtn = (
      <div className="top-bar-icn icn-min" key="1" onClick={() => mainWin.minimize()}>
        <i className="iconfont icon-msnui-minimize" />
      </div>
    );
    const maximizeBtn = (
      <div className="top-bar-icn icn-max" key="2" onClick={() => mainWin.toggleMaximize()}>
        <i className="iconfont icon-msnui-maximize" />
      </div>
    );
    const showDivision = showPage === BOILERPLATE_PAGE
      || showPage === PROJECT_PAGE
      || showPage === IMPORT_STEP1_PAGE
      || showPage === IMPORT_STEP2_PAGE
      ;

    return (
      <Dropzone className="container"
        onDrop={this.onDrop}
        onDragOver={this.onDragOver}
        onDragLeave={this.onDragLeave}
        onClick={e => e.preventDefault()}
      >
        <Layout id="main-ctn" style={{ display: 'block' }}>
          <Spin spinning={loading} size="large" wrapperClassName="main-spin">
          <Header className="top-bar">

            { showDivision && <div className="top-bar-division" /> }

            <div className="top-bar-logo" onClick={() => openUrl('https://nowa-webpack.github.io/')} />

            {
              showPage === PROJECT_PAGE &&
              <div className="top-bar-project">
                <span className="top-bar-project-name">{current.name}</span>
                <span className="top-bar-project-dir">({hidePathString((current.path || ''))})</span>
                { current.start ? <span className="top-bar-project-status start">{i18n('task.status.start')}</span>
                  : <span className="top-bar-project-status stop">{i18n('task.status.stop')}</span>}
              </div>
            }

            <div className="top-bar-option">
              { isWin
                  ? [closeBtn, maximizeBtn, minimizeBtn]
                  : [closeBtn, minimizeBtn, maximizeBtn]
              }
            </div>
          </Header>
          { children }
          </Spin>
        </Layout>
        <DragPage />
      </Dropzone>
    );
  }
}


LayoutWrap.propTypes = {
  showPage: PropTypes.string.isRequired,
  current: PropTypes.shape({
    name: PropTypes.string,
    path: PropTypes.string,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  startWacthProject: PropTypes.bool.isRequired,
  newVersion: PropTypes.string.isRequired,
  version: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default connect(({ layout, project, setting }) => ({
  showPage: layout.showPage,
  newVersion: layout.newVersion,
  version: layout.version,
  current: project.current,
  online: layout.online,
  registry: setting.registry,
  startWacthProject: project.startWacthProject,
  loading: layout.loading,
}))(LayoutWrap);
