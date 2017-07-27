/*
  项目页面框架，包含基本操作区和中间的功能tab
*/
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


export default ProjectPage;
