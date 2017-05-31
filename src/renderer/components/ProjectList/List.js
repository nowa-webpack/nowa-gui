import React, { PropTypes } from 'react';
import { connect } from 'dva';
<<<<<<< HEAD
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
=======
import Button from 'antd/lib/button';
import Tooltip from 'antd/lib/tooltip';
import i18n from 'i18n';

import Item from './Item';

const List = ({ current, projects, dispatch }) => {
  const toNewPage = () => {
    dispatch({
      type: 'layout/changeStatus',
      payload: { showPage: 1 }
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
    });
    dispatch({
      type: 'project/changeStatus',
      payload: { current: {} }
    });
<<<<<<< HEAD
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
=======
  };

  return (
    <div className="proj-list">
      <header>
        {i18n('project.list.title')}
        <Tooltip placement="bottom" title={i18n('project.list.add')} >
          <div className="list-btn iconfont icon-add"
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
            onClick={toNewPage}
          />
        </Tooltip>
        <Tooltip placement="bottom" title={i18n('project.list.import')} >
<<<<<<< HEAD
          <div className="project-sider-btn iconfont icon-folder"
            onClick={importProject}
          />
        </Tooltip>
      </header>

      <div className="project-list">
      {
        projects.length > 0 &&
=======
          <div className="list-btn iconfont icon-folder"
            onClick={() => dispatch({
              type: 'project/importProjectFromFolder',
              payload: { filePath: null, needInstall: true }
            })}
          />
        </Tooltip>
      </header>
      <div className="item-list">
      {
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
        projects.map(item =>
          <Item
            key={item.path}
            project={item}
            dispatch={dispatch}
            projPath={current.path}
          />)
      }
      </div>
<<<<<<< HEAD
      { showSideMask && <div className="main-sider-mask" />}
=======
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
    </div>
  );
};

<<<<<<< HEAD
=======
// <Tooltip placement="bottom" title={i18n('project.list.add')} >
//     <Button type="default"
//       shape="circle"
//       size="small"
//       icon="plus"
//       onClick={toNewPage}
//     />
//   </Tooltip>
//   <Tooltip placement="bottom" title={i18n('project.list.import')} >
//     <Button type="default"
//       shape="circle"
//       size="small"
//       icon="folder"
//       onClick={() => dispatch({
//         type: 'project/importProj',
//         payload: { filePath: null, needInstall: true }
//       })}
//     />
//   </Tooltip>

>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
List.propTypes = {
  current: PropTypes.shape({
    name: PropTypes.string,
    path: PropTypes.string,
  }).isRequired,
  projects: PropTypes.array,
<<<<<<< HEAD
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
=======
  dispatch: PropTypes.func.isRequired,
};

export default connect(({ project, task, layout }) => ({ 
  current: project.current,
  projects: project.projects,
  task,
  layout,
}))(List);
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
