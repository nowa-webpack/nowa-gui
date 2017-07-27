/*
  左侧项目列表
*/
import React, { PropTypes } from 'react';
import { connect } from 'dva';
import Tooltip from 'antd/lib/tooltip';

import i18n from 'i18n-renderer-nowa';
import { BOILERPLATE_PAGE, IMPORT_STEP1_PAGE, IMPORT_STEP2_PAGE } from 'const-renderer-nowa';
import Item from './Item';

const List = ({
  current,
  projects,
  showPage,
  dispatch
}) => {
  const toNewPage = () => {
    dispatch({
      type: 'layout/changeStatus',
      payload: { showPage: BOILERPLATE_PAGE }
    });
    dispatch({
      type: 'project/changeStatus',
      payload: { current: {} }
    });
    dispatch({
      type: 'projectCreate/changeStatus',
      payload: { processStep: 0 }
    });
  };

  const importProject = () => dispatch({
    type: 'projectCreate/folderImport',
    payload: { projPath: null }
  });

  const showSideMask = showPage === IMPORT_STEP1_PAGE || showPage === IMPORT_STEP2_PAGE;

  return (
    <div className="project-sider">
      <header className="project-sider-title">
        {i18n('project.list.title')}
        <Tooltip placement="bottom" title={i18n('project.list.add')} >
          <div
            className="project-sider-btn iconfont icon-add"
            onClick={toNewPage}
          />
        </Tooltip>
        <Tooltip placement="bottom" title={i18n('project.list.import')} >
          <div className="project-sider-btn iconfont icon-folder"
            onClick={importProject}
          />
        </Tooltip>
      </header>

      <div className="project-list">
      {
        projects.length > 0 &&
        projects.map(item =>
          <Item
            key={item.path}
            project={item}
            dispatch={dispatch}
            projPath={current.path}
          />)
      }
      </div>
      { showSideMask && <div className="main-sider-mask" />}
    </div>
  );
};

List.propTypes = {
  current: PropTypes.shape({
    name: PropTypes.string,
    path: PropTypes.string,
  }).isRequired,
  projects: PropTypes.array,
  showPage: PropTypes.string.isRequired,
  // showSideMask: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect(({ project, layout }) => ({ 
  current: project.current,
  projects: project.projects,
  showPage: layout.showPage,
  // showSideMask: layout.showSideMask,
}))(List);