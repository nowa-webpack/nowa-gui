import React, { PropTypes } from 'react';
import Tabs from 'antd/lib/tabs';
import i18n from 'i18n';

import Form from './Form';
import Term from './Term';

const TabPane = Tabs.TabPane;


const Tab = ({ current, termBuild, termStart, activeTab, dispatch }) => {
  const buildProps = {
    name: current.path,
    type: 'build',
    term: termBuild,
    dispatch
  };
  const startProps = {
    name: current.path,
    type: 'start',
    term: termStart,
    dispatch
  };

  return (
    <Tabs
      className="detail-tabs"
      defaultActiveKey="1"
      animated={false}
      onChange={() => {}}
    >
      <TabPane tab={i18n('project.tab.console')} key="1">
        <Tabs
          className="terminal-tabs"
          defaultActiveKey="1"
          activeKey={activeTab}
          onChange={index => dispatch({
            type: 'layout/changeLogTab',
            payload: {
              activeTab: index + ''
            }
          })}
        >
          <TabPane tab={i18n('project.tab.listen_log')} key="1"><Term {...startProps} />
          </TabPane>
          <TabPane tab={i18n('project.tab.compile_log')} key="2"><Term {...buildProps} />
          </TabPane>
        </Tabs>
      </TabPane>
      <TabPane tab={i18n('project.tab.setting')} key="2"><Form />
      </TabPane>
    </Tabs>
  );
};

Tab.propTypes = {
  termStart: PropTypes.object,
  termBuild: PropTypes.object,
  activeTab: PropTypes.string.isRequired,
  current: PropTypes.shape({
    path: PropTypes.string
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default Tab;
