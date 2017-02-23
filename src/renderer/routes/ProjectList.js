import React, {Component} from 'react';
import { connect } from 'dva';
// import { hashHistory } from 'react-router';
import Button from 'antd/lib/button';
import i18n from 'i18n';

import ProjectItem from '../components/ProjectList/Item';

const ProjectList = ({ project: { projects, current }, dispatch }) => {
  const emptyDIV = (
      <div className="empty">
        <div className="add-cnt"><i className="iconfont icon-add" /></div>
        {i18n('project.list.empty')}
      </div>
    );

  const list = projects.length
    ? projects.map(item =>
        <ProjectItem
          key={item.name}
          project={item}
          dispatch={dispatch}
          current={current.name}
        />)
    : emptyDIV;
    
  return (
    <div className="project-list">
      <h2 className="title">{i18n('project.list.title')}</h2>
      <div className="project-body">{ list }</div>
    </div>
  );
};

export default connect(({ project }) => ({ project }))(ProjectList);
