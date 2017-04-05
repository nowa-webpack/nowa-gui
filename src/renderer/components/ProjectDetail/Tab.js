import React, { PropTypes } from 'react';
import Tabs from 'antd/lib/tabs';
import i18n from 'i18n';

import ProjectSetting from '../ProjectSetting';
import CommandTermList from './CommandTermList';
import Terminal from './Terminal';
import PackageManager from '../PackageManager';

const TabPane = Tabs.TabPane;


const Tab = ({ current, logType, dispatch, commands }) => {
  const cmdList = Object.keys(commands).filter(cmd => cmd !== 'start' && cmd !== 'build');
  // const hasCmdSide = cmdList.length > 0;
  const listCmd = cmdList.map(name => ({ ...commands[name], name }));
  const termProps = {
    dispatch,
    name: current.path,
    hasSide: true,
    logType,
    otherCommands: cmdList
  };

  const listProps = {
    dispatch,
    name: current.path,
    commands: listCmd,
    logType,
    // commands: cmdList
  };

  const settingProps = {
    project: current,
    dispatch,
  };

  return (
    <Tabs
      className="detail-tabs"
      defaultActiveKey="1"
      animated={false}
      onChange={() => {}}
    >
      <TabPane tab={i18n('project.tab.console')} key="1">
        <div className="cnl-wrap">
        <Terminal {...termProps} />
        <CommandTermList {...listProps} />
        </div>
      </TabPane>
      <TabPane tab={i18n('project.tab.setting')} key="2" className="set-tabpane"><ProjectSetting {...settingProps} />
      </TabPane>
      <TabPane tab={i18n('project.tab.package')} key="3" className="set-tabpane"><PackageManager {...settingProps} />
      </TabPane>
    </Tabs>
  );
};


Tab.propTypes = {
  commands: PropTypes.object,
  logType: PropTypes.string.isRequired,
  current: PropTypes.shape({
    path: PropTypes.string
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default Tab;
