import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import Tabs from 'antd/lib/tabs';

import i18n from 'i18n-renderer-nowa';
import { getSpiltDependencies } from 'util-renderer-nowa';
// import BasicForm from './BasicForm';
// import BuildForm from './BuildForm';
import Table from './Table';

const TabPane = Tabs.TabPane;

class SettingTab extends Component {
  constructor(props) {
    super(props);
    const dp = getSpiltDependencies(props.current.pkg);
    this.state = {
      activeKey: '1',
      ...dp
    };
  }

  componentWillReceiveProps({ current }) {
    if (current.path !== this.props.current.path) {
      const dp = getSpiltDependencies(current.pkg);
      this.setState({
        activeKey: '1',
        ...dp
      });
    }

  }

  render() {
    const { current, online, registry, dispatch } = this.props;
    const { activeKey, dependencies, devDependencies } = this.state;
    const basicProps = { online, registry, projPath: current.path, dispatch };

    return (
      <div className="project-sub">
        <Tabs
          type="card"
          className="project-sub-tabs"
          activeKey={activeKey}
          onChange={index => this.setState({ activeKey: index })}
        >
          <TabPane tab="Dependencies" key="1" className="project-sub-tabpane">
            <Table source={dependencies} type="dependencies" {...basicProps} />
          </TabPane>
          <TabPane tab="Dev Dependencies" key="2" className="project-sub-tabpane">
            <Table source={devDependencies} type="devDependencies" {...basicProps} />
          </TabPane>
        </Tabs>
      </div>);
  }
}


SettingTab.propTypes = {
  current: PropTypes.shape({
    path: PropTypes.string.isRequired,
    pkg: PropTypes.object.isRequired,
  }).isRequired,
  registry: PropTypes.string.isRequired,
  online: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect(({ project, setting, layout }) => ({
  current: project.current,
  registry: setting.registry,
  online: layout.online,
}))(SettingTab);
