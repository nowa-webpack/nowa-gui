import React, {Component} from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Tabs from 'antd/lib/tabs';
import i18n from 'i18n';

import Form from './Form';
import Term from './Term';

const TabPane = Tabs.TabPane;

/*class Tab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      outActiveTab: '1'
    };
    this.changeLogTab = this.changeLogTab.bind(this);
  }

  changeLogTab(index) {
    const { dispatch } = this.props;
    dispatch({
      type: 'layout/changeLogTab',
      payload: {
        activeTab: index + ''
      }
    });
  }

  componentWillReceiveProps(next) {
    if(next.activeTab != this.props.activeTab){
      this.setState({ outActiveTab: '1' });
    }
  }

  render() {
    const { current, termBuild, termStart, activeTab, dispatch } = this.props;
    const { outActiveTab } = this.state;
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
        activeKey={outActiveTab}
        onChange={index => this.setState({ outActiveTab: index + ''})}
      >
        <TabPane tab={'Console'} key="1">
          <Tabs
            className="terminal-tabs"
            defaultActiveKey="1"
            activeKey={activeTab}
            onChange={this.changeLogTab}
          >
            <TabPane tab={'listen'} key="1"><Term {...startProps} />
            </TabPane>
            <TabPane tab={'compile'} key="2"><Term {...buildProps} />
            </TabPane>
          </Tabs>
        </TabPane>
        <TabPane tab={'Setting'} key="2"><Form />
        </TabPane>
      </Tabs>
    );
  }
}

export default Tab;*/

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
      onChange={() => {}}>
      <TabPane tab={'Console'} key="1">
        <Tabs
          className="terminal-tabs"
          defaultActiveKey="1"
          activeKey={activeTab}
          onChange={index => dispatch({
            type: 'layout/changeLogTab',
            payload: {
              activeTab: index + ''
            }
          })}>
          <TabPane tab={'listen'} key="1"><Term {...startProps} />
          </TabPane>
          <TabPane tab={'compile'} key="2"><Term {...buildProps} />
          </TabPane>
        </Tabs>
      </TabPane>
      <TabPane tab={'Setting'} key="2"><Form />
      </TabPane>
    </Tabs>
  );
};
export default Tab;

/*export default connect(({ task, project }) => ({
  // name: project.current.path,
  // termBuild: task.build[project.current.path],
  // termStart: task.start[project.current.path],
}))(Tab);*/
