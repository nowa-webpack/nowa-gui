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
          <Button type="default"
            shape="circle"
            size="small"
            icon="plus"
            onClick={toNewPage}
          />
        </Tooltip>
        <Tooltip placement="bottom" title={i18n('project.list.import')} >
          <Button type="default"
            shape="circle"
            size="small"
            icon="folder"
            onClick={() => dispatch({
              type: 'project/importProj',
              payload: { filePath: null, needInstall: true }
            })}
          />
        </Tooltip>
      </header>
      <div className="item-list">
      {
        projects.map(item =>
          <Item
            key={item.name}
            project={item}
            dispatch={dispatch}
            filePath={current.name}
          />)
      }
      </div>
    </div>
  );
};

List.propTypes = {
  current: PropTypes.shape({
    name: PropTypes.string,
  }).isRequired,
  projects: PropTypes.array,
  // showModal: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect(({ project, task, layout }) => ({ 
  current: project.current,
  projects: project.projects,
  task,
  layout,
  // showModal: layout.showRemoveModal
}))(List);
