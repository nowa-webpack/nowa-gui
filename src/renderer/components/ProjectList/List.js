import React, { PropTypes } from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Tooltip from 'antd/lib/tooltip';
import i18n from 'i18n';

import Item from './Item';

const List = ({ current, projects, dispatch }) => {

  return (
    <div className="proj-list">
      <header>
        {i18n('project.list.title')}
        <Tooltip placement="bottom" title={i18n('project.list.add')} >
          <Button type="default"
            shape="circle"
            size="small"
            icon="plus"
            onClick={() => dispatch({
              type: 'layout/changeStatus',
              payload: { showPage: 1 }
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
            current={current.name}
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
  dispatch: PropTypes.func.isRequired,
};

export default connect(({ project, task, layout }) => ({ 
  current: project.current,
  projects: project.projects,
  task,
  layout
}))(List);
