import React, { PropTypes } from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Tooltip from 'antd/lib/tooltip';
import i18n from 'i18n';

import Item from './Item';

const List = ({ current, projects, dispatch }) => {
  const toNewPage = () => {
    dispatch({
      type: 'layout/changeStatus',
      payload: { showPage: 1 }
    });
    dispatch({
      type: 'project/changeStatus',
      payload: { current: {} }
    });
  };

  return (
    <div className="proj-list">
      <header>
        {i18n('project.list.title')}
        <Tooltip placement="bottom" title={i18n('project.list.add')} >
          <div className="list-btn iconfont icon-add"
            onClick={toNewPage}
          />
        </Tooltip>
        <Tooltip placement="bottom" title={i18n('project.list.import')} >
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
        projects.map(item =>
          <Item
            key={item.path}
            project={item}
            dispatch={dispatch}
            projPath={current.path}
          />)
      }
      </div>
    </div>
  );
};

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

List.propTypes = {
  current: PropTypes.shape({
    name: PropTypes.string,
    path: PropTypes.string,
  }).isRequired,
  projects: PropTypes.array,
  dispatch: PropTypes.func.isRequired,
};

export default connect(({ project, task, layout }) => ({ 
  current: project.current,
  projects: project.projects,
  task,
  layout,
}))(List);
