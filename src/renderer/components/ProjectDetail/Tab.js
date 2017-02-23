import React, {Component} from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Tabs from 'antd/lib/tabs';
import i18n from 'i18n';

import Form from './Form';
// import CompileTerm from '../Xterm/CompileTerm';
// import ListenTerm from '../Xterm/ListenTerm';
import Terminal from './Terminal';

const TabPane = Tabs.TabPane;

const Tab = ({ config, activeTab, dispatch, name, termBuild, termStart }) => {

  const buildProps = {
    name,
    type: 'build',
    term: termBuild,
    dispatch
  };
  const startProps = {
    name,
    type: 'start',
    term: termStart,
    dispatch
  };

  return (
    <Tabs
      type="card"
      className="detail-tabs"
      defaultActiveKey="1"
      activeKey={activeTab}
      onTabClick={index => dispatch({
        type: 'layout/changeStatus',
        payload: {
          activeTab: index + ''
        }
      })}
    >
      <TabPane tab={i18n('project-item.log.text')} key="1">
        <Terminal {...startProps} />
      </TabPane>
      <TabPane tab={i18n('project-item.compile.text')} key="2">
        <Terminal {...buildProps} />
      </TabPane>
      <TabPane tab={i18n('project-item.setting.text')} key="3">
        <Form {...config} dispatch={dispatch} />
      </TabPane>
    </Tabs>
  );
};

// <TabPane tab={i18n('project-item.log.text')} key="1"><ListenTerm /></TabPane>
      // <TabPane tab={i18n('project-item.compile.text')} key="2"><CompileTerm /></TabPane>


// export default Tab;
export default connect(({ task, project }) => ({
  name: project.current.path,
  termBuild: task.build[project.current.path],
  termStart: task.start[project.current.path],
}))(Tab);
