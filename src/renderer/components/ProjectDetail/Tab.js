import React, { PropTypes } from 'react';
import Tabs from 'antd/lib/tabs';
import i18n from 'i18n';

import SettingForm from './SettingForm';
import CommandForm from './CommandForm';
import CommandTermList from './CommandTermList';
import Term from './Term';

const TabPane = Tabs.TabPane;


const Tab = ({ current, logType, dispatch, commands }) => {
  /*const buildProps = {
    name: current.path,
    type: 'build',
    dispatch
  };
  const startProps = {
    name: current.path,
    type: 'start',
    dispatch
  };*/

  const cmdList = Object.keys(commands).filter(cmd => cmd !== 'start' && cmd !== 'build');
  const hasCmdSide = cmdList.length > 0;
  const termProps = {
    dispatch,
    name: current.path,
    hasSide: hasCmdSide,
    logType,
    otherCommands: cmdList
  };

  return (
    <Tabs
      className="detail-tabs"
      defaultActiveKey="1"
      animated={false}
      onChange={() => {}}
    >
      <TabPane tab={i18n('project.tab.console')} key="1">
        <Term {...termProps} />
        { hasCmdSide && <CommandTermList commands={cmdList} dispatch={dispatch} />}
      </TabPane>
      <TabPane tab={i18n('project.tab.command')} key="2"><CommandForm commands={commands} dispatch={dispatch} />
      </TabPane>
      <TabPane tab={i18n('project.tab.setting')} key="3"><SettingForm />
      </TabPane>
    </Tabs>
  );
};

Tab.propTypes = {
  // termStart: PropTypes.object,
  commands: PropTypes.object,
  logType: PropTypes.string.isRequired,
  current: PropTypes.shape({
    path: PropTypes.string
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default Tab;
