import React, { PropTypes } from 'react';
import Tabs from 'antd/lib/tabs';
import i18n from 'i18n';

import SettingForm from './SettingForm';
import CommandTermList from './CommandTermList';
import Terminal from './Terminal';

const TabPane = Tabs.TabPane;


const Tab = ({ current, logType, dispatch, commands }) => {
  const cmdList = Object.keys(commands).filter(cmd => cmd !== 'start' && cmd !== 'build');
  const hasCmdSide = cmdList.length > 0;
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
    commands: cmdList
  };

  return (
    <Tabs
      className="detail-tabs"
      defaultActiveKey="1"
      animated={false}
      onChange={() => {}}
    >
      <TabPane tab={i18n('project.tab.console')} key="1">
        <Terminal {...termProps} />
        <CommandTermList {...listProps} />
      </TabPane>
     
      <TabPane tab={i18n('project.tab.setting')} key="3"><SettingForm />
      </TabPane>
    </Tabs>
  );
};
 // <TabPane tab={i18n('project.tab.package')} key="2">ssss
 //      </TabPane>

Tab.propTypes = {
  commands: PropTypes.object,
  logType: PropTypes.string.isRequired,
  current: PropTypes.shape({
    path: PropTypes.string
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default Tab;
