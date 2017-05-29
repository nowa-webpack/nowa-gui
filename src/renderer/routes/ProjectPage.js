import React, { PropTypes } from 'react';
import { Content } from 'antd/lib/layout';

import TopTasks from '../components/Project/TopTasks';
import MainTab from '../components/Project/MainTab';

const ProjectPage = () => (
  <Content className="project">
    <MainTab />
    <TopTasks />
  </Content>
);


ProjectPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default ProjectPage;
