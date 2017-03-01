import React, {Component} from 'react';
import classnames from 'classnames';
import Badge from 'antd/lib/badge';
import i18n from 'i18n';


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
        showPage: 2
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
    <div className={classnames({
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

export default Item;

