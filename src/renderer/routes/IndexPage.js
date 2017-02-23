import React, { Component } from 'react';
import { connect } from 'dva';
import Layout from 'antd/lib/layout';
import Button from 'antd/lib/button';
import { remote } from 'electron';

import ProjectList from './ProjectList';
import ProjectDetail from './ProjectDetail';
import NewProject from './NewProject';
import SettingFoot from './SettingFoot';

const { Sider, Content } = Layout;
const { win } = remote.getGlobal('services');

class IndexPage extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    const { dispatch } = this.props;
    const holder = this.refs.container;
    holder.ondragover = () => false;
    holder.ondragleave = holder.ondragend = () => false;
    holder.ondrop = (e) => {
      e.preventDefault();
      for (let f of e.dataTransfer.files) {
        // console.log('File(s) you dragged here: ', f.path);
        dispatch({
          type: 'project/importProj',
          payload: { filePath: f.path }
        });
      }
      return false;
    };
  }
  render() {
    const { showNewProject, dispatch } = this.props;
    const rightSide = showNewProject ? <NewProject /> : <ProjectDetail /> ;

    return (
      <div ref="container" style={{ height: '100%' }}>
        <Layout className="container">
          <Sider className="left-side">
            <ProjectList />
            <SettingFoot />
          </Sider>
          <Content className="right-side">
            <div className="app-opt">
              <i className="iconfont icon-close" onClick={() => win.close()} />
              <i className="iconfont icon-subtract" onClick={() => win.minimize()} />
            </div>
            { rightSide }
          </Content>
        </Layout>
        
      </div>
    );
  }
}

export default connect(({ layout }) => ({ showNewProject: layout.showNewProject }))(IndexPage);



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
