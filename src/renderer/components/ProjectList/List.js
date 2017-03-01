import React from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import i18n from 'i18n';

import Item from './Item';

const List = ({ current, projects, dispatch }) => {

  return (
    <div className="proj-list">
      <header>
        项目
        <Button type="default"
          shape="circle"
          size="small"
          icon="plus"
          onClick={() => dispatch({
            type: 'layout/changeStatus',
            payload: { showPage: 1 }
          })}
        />
      </header>
      <div className="item-list">
      {
        projects.map(item =>
          <Item
            key={item.name}
            project={item}
            dispatch={dispatch}
            current={current.name}
          />)
      }
      </div>
    </div>
    );
};

export default connect(({ project, task, layout }) => ({ 
  current: project.current,
  projects: project.projects,
  task,
  layout
 }))(List);