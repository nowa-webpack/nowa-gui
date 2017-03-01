import React, { Component } from 'react';
import { remote, shell } from 'electron';
import Dropzone from 'react-dropzone';
import { connect } from 'dva';
import Layout from 'antd/lib/layout';
import Modal from 'antd/lib/modal';


import WelcomePage from './WelcomePage';
import DragPage from './DragPage';
import MainPage from './MainPage';
import { hidePathString } from '../util';

const confirm = Modal.confirm;
const { Header } = Layout;
const { win, upgrade } = remote.getGlobal('services');
const isWin = process.platform === 'win32';

class IndexPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDrag: false
    };
    this.onDrop = this.onDrop.bind(this);
  }
  componentDidMount() {
    upgrade.checkLatest();
  }

  componentWillReceiveProps(next) {
    if (next.newVersion !== this.props.newVersion) {
      confirm({
        title: 'Want to update to new release?',
        content: <div><p>Current Version {this.props.newVersion}</p>
              <p>Next Version {next.newVersion}</p></div>,
        onOk() {
          dispatch({
            type: 'layout/upgrade',
          });
        },
        onCancel() {},
      });
    }
  }

  onDrop(acceptedFiles, rejectedFiles) {
    const { dispatch } = this.props;

    this.props.dispatch({
      type: 'project/importProj',
      payload: { filePath: acceptedFiles[0].path }
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
    const { showPage, dispatch, version, current } = this.props;
    const { showDrag } = this.state;

    const closeBtn = <div className="icn icn-x" key="0" onClick={() => win.close()}>
      <i className="iconfont icon-x" /></div>;
    const minimizeBtn = <div className="icn icn-min" key="1" onClick={() => win.minimize()}>
      <i className="iconfont icon-msnui-minimize" /></div>;
    const maximizeBtn = <div className="icn icn-max" key="2">
      <i className="iconfont icon-msnui-maximize" /></div>;


    // const mainbody = showPage 
    const mainbody = true 
      ? <MainPage showPage={showPage} /> 
      : <WelcomePage version={version} dispatch={dispatch} />;

    return (
      <Dropzone className="container" 
        onDrop={this.onDrop} 
        onDragOver={this.onDragOver}
        onDragLeave={this.onDragLeave}
        onClick={e => { e.preventDefault();}}>
        <Layout className="ui-layout" id="main-ctn">
          <Header className="top-bar">
            { showPage > 0 && <div className="bar-bd" /> }
            <div className="logo" onClick={() => shell.openExternal('https://nowa-webpack.github.io/')} />
            { showPage == 2 && <div className="proj-path">
              {current.name}
              <span>({hidePathString(current.path)})</span>
            </div>}

            <div className="app-opt">
              { isWin ? [closeBtn, maximizeBtn, minimizeBtn] : [closeBtn, minimizeBtn, maximizeBtn]}
            </div>
          </Header>
          { mainbody }
        </Layout>
        <DragPage />
      </Dropzone>
    );
  }
}

export default connect(({ layout, project }) => ({
  showPage: layout.showPage,
  newVersion: layout.newVersion,
  version: layout.version,
  shouldAppUpdate: layout.shouldAppUpdate,
  current: project.current 
}))(IndexPage);



   /* switch (showPage) {
      case 0:
        mainbody = <WelcomePage version={version} dispatch={dispatch} />;
        break;
      case 1:
        mainbody = <NewProjectPage />;
        break;
      case 2:
        mainbody = <ProjectDetailPage />;
        break;
      default:
        mainbody = <WelcomePage version={version} dispatch={dispatch} />;
    }*/
// <Sider className="left-side">
//             <ProjectList />
//             <SettingFoot />
//           </Sider>
//           <Content className="right-side">
//             <div className="app-opt">
//               <i className="iconfont icon-close" onClick={() => win.close()} />
//               <i className="iconfont icon-subtract" onClick={() => win.minimize()} />
//             </div>
//             { rightSide }
//           </Content>



// <ReactCSSTransitionGroup
//           component="div"
//           transitionName="example"
//           className="tra-container"
//           transitionAppear={true}
//           transitionAppearTimeout={500}
//           transitionEnterTimeout={500}
//           transitionLeaveTimeout={500}
//           >
//             {
//               // children
//               React.cloneElement(children, {
//                 key: history.pathname,
//               })
//             }
//           </ReactCSSTransitionGroup>
