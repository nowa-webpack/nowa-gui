/*
  项目设置
*/
import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import Tabs from 'antd/lib/tabs';

import i18n from 'i18n-renderer-nowa';
import BasicForm from './BasicForm';
import BuildForm from './BuildForm';
import ServerForm from './ServerForm';

const TabPane = Tabs.TabPane;

class SettingTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: '1',
    };
  }

  componentWillReceiveProps({ current }) {
    if (current.path !== this.props.current.path) {
      this.setState({
        activeKey: '1'
      });
    }
  }

  render() {
    const { current: { isNowa } } = this.props;
    const { activeKey } = this.state;

    const BasicFormGen = () => <BasicForm />;

    // 非nowa 项目忽视server和build配置
    return (
      <div className="project-sub">
        <Tabs type="card" className="project-sub-tabs"
          activeKey={activeKey}
          onChange={index => this.setState({ activeKey: index })}
        >
          <TabPane tab={i18n('project.tab.basic')} key="1" className="project-sub-tabpane"><BasicFormGen /></TabPane>
          { isNowa &&
            <TabPane tab={i18n('project.tab.server')} key="2" className="project-sub-tabpane"><ServerForm /></TabPane>
          }
          { isNowa &&
            <TabPane tab={i18n('project.tab.build')} key="3" className="project-sub-tabpane">
              <BuildForm />
            </TabPane>
          }
        </Tabs>
      </div>);
  }
}


SettingTab.propTypes = {
  current: PropTypes.shape({
    path: PropTypes.string,
    isNowa: PropTypes.bool,
  }).isRequired,
};

export default connect(({ project }) => ({
  current: project.current,
}))(SettingTab);
