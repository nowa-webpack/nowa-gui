import React, { Component, PropTypes } from 'react';
import Tabs from 'antd/lib/tabs';

import i18n from 'i18n';
// import { PORT_MATCH } from 'gui-const';

import BuildConfigForm from './BuildConfigForm';
import ServerConfigForm from './ServerConfigForm';
import BasicConfigForm from './BasicConfigForm';

const TabPane = Tabs.TabPane;

class SettingTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: '1',
    };
  }

  componentWillReceiveProps({ project }) {
    if (project.path !== this.props.project.path) {
      this.setState({
        activeKey: '1'
      });
    }
  }

  render() {
    const { project: { isNowa } } = this.props;
    const { activeKey } = this.state;

    return (
      <div className="setting">
        <Tabs type="card" className="setting-tabs"
          activeKey={activeKey}
          onChange={index => this.setState({ activeKey: index })}
        >
          <TabPane tab={i18n('project.tab.basic')} key="1"><BasicConfigForm /></TabPane>
          { isNowa &&
            <TabPane tab={i18n('project.tab.server')} key="2"><ServerConfigForm /></TabPane>
          }
          { isNowa &&
            <TabPane tab={i18n('project.tab.build')} key="3"><BuildConfigForm /></TabPane>
          }
        </Tabs>
      </div>);
  }
}


SettingTab.propTypes = {
  project: PropTypes.shape({
    path: PropTypes.string
  }).isRequired,
  // dispatch: PropTypes.func.isRequired,
};

export default SettingTab;
