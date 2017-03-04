import React, { PropTypes } from 'react';
import classnames from 'classnames';
import Badge from 'antd/lib/badge';


const Item = ({ project, current, dispatch }) => {

  const { name, start, taskErr } = project;

  const handleClick = () => {
    dispatch({
      type: 'project/changeStatus',
      payload: {
        current: project
      }
    });
    dispatch({
      type: 'layout/changeStatus',
      payload: {
        showPage: 2,
        activeTab: '1'
      }
    });
  };

  let status;

  if (taskErr) {
    status = <Badge status="warning" />;
  } else if (start) {
    status = <Badge status="processing" />;
  }

  return (
    <div
      className={classnames({
        item: true,
        'item-active': current === name
      })}
      onClick={handleClick}
    >
      { status }
      <span className="name">{ name }</span>
    </div>
  );
};

Item.propTypes = {
  current: PropTypes.string.isRequired,
  project: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default Item;

