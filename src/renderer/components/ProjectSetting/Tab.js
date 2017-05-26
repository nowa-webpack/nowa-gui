import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import Tabs from 'antd/lib/tabs';

import i18n from 'i18n-renderer-nowa';

import BasicForm from './BasicForm';
import BuildForm from './BuildForm';
import ServerForm from './ServerForm';
// import BasicConfigForm from './BasicConfigForm';

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
    // const BuildFormGen = () => <BuildForm />;

    return (
      <div className="project-setting">
        <Tabs type="card" className="project-setting-tabs"
          activeKey={activeKey}
          onChange={index => this.setState({ activeKey: index })}
        >
          <TabPane tab={i18n('project.tab.basic')} key="1" className="project-setting-tabpane"><BasicFormGen /></TabPane>
          { isNowa &&
            <TabPane tab={i18n('project.tab.server')} key="2" className="project-setting-tabpane"><ServerForm /></TabPane>
          }
          { isNowa &&
            <TabPane tab={i18n('project.tab.build')} key="3" className="project-setting-tabpane">
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
  // dispatch: PropTypes.func.isRequired,
};

export default connect(({ project, task }) => ({
  current: project.current,
}))(SettingTab);
