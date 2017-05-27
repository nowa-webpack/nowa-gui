import React from 'react';
import Tabs from 'antd/lib/tabs';
import i18n from 'i18n-renderer-nowa';

import ProjectSetting from '../ProjectSetting/Tab';
import ProjectDependency from '../ProjectDependency/Tab';
import ProjectConsole from '../ProjectConsole/Wrap';

const TabPane = Tabs.TabPane;

const Tab = () => (
  <Tabs
    className="project-tabs"
    defaultActiveKey="2"
    animated={false}
  >
    <TabPane tab={i18n('project.tab.console')} key="1" className="project-tabpane">
      <ProjectConsole />
    </TabPane>
    <TabPane tab={i18n('project.tab.setting')} key="2" className="project-tabpane">
      <ProjectSetting />
    </TabPane>
    <TabPane tab={i18n('project.tab.package')} key="3" className="project-tabpane">
      <ProjectDependency />
    </TabPane>
  </Tabs>
);

export default Tab;
