import React, { PropTypes } from 'react';
import { connect } from 'dva';
import { shell, remote } from 'electron';
import { join } from 'path';
import classNames from 'classnames';
import { Content } from 'antd/lib/layout';
import Tooltip from 'antd/lib/tooltip';
import Spin from 'antd/lib/spin';
import i18n from 'i18n-renderer-nowa';

import TopTasks from '../components/Project/TopTasks';
import MainTab from '../components/Project/MainTab';

const ProjectPage = ({
  // logType,
  // dispatch,
  // commands,
}) => {
  return (
    <Content className="project">
      <MainTab />
      <TopTasks />
    </Content>
  );
};


ProjectPage.propTypes = {
  // logType: PropTypes.string.isRequired,
  // commands: PropTypes.object,
  // current: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect(({ project, task }) => ({
  current: project.current,
  commands: task.commands,
  logType: task.logType,
}))(ProjectPage);
