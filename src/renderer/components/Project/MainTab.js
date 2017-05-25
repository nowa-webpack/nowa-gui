import React, { PropTypes } from 'react';
import Tabs from 'antd/lib/tabs';
import i18n from 'i18n-renderer-nowa';

import ProjectSetting from '../ProjectSetting/Tab';
// import CommandTermList from '../ProjectTaskLog/CommandTermList';
// import Terminal from '../ProjectTaskLog/Terminal';
// import PackageManager from '../PackageManager';

const TabPane = Tabs.TabPane;


const Tab = ({
  // current,
  // logType,
  // dispatch,
  // commands,
}) => {
  // const cmdList = Object.keys(commands).filter(cmd => cmd !== 'start' && cmd !== 'build');
  // const hasCmdSide = cmdList.length > 0;
  // const listCmd = cmdList.map(name => ({ ...commands[name], name }));
  // const termProps = {
  //   dispatch,
  //   name: current.path,
  //   hasSide: true,
  //   logType,
  //   otherCommands: cmdList
  // };

  // const listProps = {
  //   dispatch,
  //   name: current.path,
  //   commands: listCmd,
  //   logType,
  //   // commands: cmdList
  // };

  // const settingProps = {
  //   project: current,
  //   dispatch,
  //   globalRegistry,
  // };

  return (
    <Tabs
      className="project-tabs"
      defaultActiveKey="2"
      animated={false}
    >
      <TabPane tab={i18n('project.tab.console')} key="1" className="project-tabpane">
        <div >dd</div>
      </TabPane>
      <TabPane tab={i18n('project.tab.setting')} key="2" className="project-tabpane">
        <ProjectSetting />
      </TabPane>
      <TabPane tab={i18n('project.tab.package')} key="3" className="project-tabpane"><div />
      </TabPane>
    </Tabs>
  );
};


/*Tab.propTypes = {
  commands: PropTypes.object,
  // logType: PropTypes.string.isRequired,
  // registry: PropTypes.string.isRequired,
  current: PropTypes.shape({
    path: PropTypes.string
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
};*/

export default Tab;
