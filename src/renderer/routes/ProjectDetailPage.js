import React from 'react';
import { connect } from 'dva';
import { shell } from 'electron';
import { join } from 'path';
import Layout from 'antd/lib/layout';
import Button from 'antd/lib/button';

import Tab from '../components/ProjectDetail/Tab';

const { Content } = Layout;

const ProjectDetailPage = ({ current, termBuild, termStart, activeTab, dispatch }) => {
  const { start, port, path } = current;
  const tabProps = { current, termBuild, termStart, activeTab, dispatch };
  return (
    <Content className="ui-content proj-detail">
      <Tab {...tabProps} />
      <div className="opt-grp">
        { !start ? <div className="opt start" onClick={() => {}}>
          <i className="iconfont icon-play" /><br />开始
        </div> :
        <div className="opt " onClick={() => {}}>
          <i className="iconfont icon-stop" /><br />停止
        </div> }
        { start && <div className="opt "
          onClick={() => shell.openExternal(`http://localhost:${port}`)}>
          <i className="iconfont icon-compass" /><br />访问
        </div> }
        <div className="opt " 
          onClick={() => dispatch({
            type: 'task/build',
            payload: { project: current }
          })}>
          <i className="iconfont icon-similarproduct" /><br />编译
        </div>
        <div className="opt " onClick={() => {}}>
          <i className="iconfont icon-code" /><br />代码
        </div>
        <div className="opt " onClick={() => shell.showItemInFolder(join(path, 'abc.json'))}>
          <i className="iconfont icon-folder" /><br />打开
        </div>
      </div>
    </Content>
  );
};

export default connect(({ project, task, layout }) => ({ 
  current: project.current,
  termBuild: task.build[project.current.path],
  termStart: task.start[project.current.path],
  activeTab: layout.activeTab
}))(ProjectDetailPage);