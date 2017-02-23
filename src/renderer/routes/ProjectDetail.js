import React from 'react';
import { connect } from 'dva';
// import { hashHistory } from 'react-router';
import Button from 'antd/lib/button';
import Tooltip from 'antd/lib/tooltip';
import i18n from 'i18n';

import Operations from '../components/ProjectDetail/Operations';
import Tab from '../components/ProjectDetail/Tab';

const ButtonGroup = Button.Group;

const ProjectDetail = ({ config, activeTab, dispatch }) => {
  return (
    <div className="project-detail" style={{ background: '#fff' }}>
      <header className="header">
        <Operations project={config} />
        <div className="port">Port : <span>{ config.port }</span></div>
        <div className="path">Path : <Tooltip title={config.path} >{ config.path }</Tooltip></div>
      </header>
        <Tab activeTab={activeTab} />
    </div>
  );
};

export default connect(({ project, layout }) => ({
  config: project.current,
  activeTab: layout.activeTab,
}))(ProjectDetail);

// <Layout className="project-detail" style={{ background: '#fff' }}>
//       <Header className="detail-bg">
//         <div className="port">Listen at : <span>{ config.port }</span></div>
//         <Operations project={config} />
//         <div className="path">Path : <Tooltip title={config.path} >{ config.path }</Tooltip></div>
//       </Header>
//       <Tab activeTab={activeTab} />
//     </Layout>
