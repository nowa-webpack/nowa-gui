import React, {Component} from 'react';
import classnames from 'classnames';
import Badge from 'antd/lib/badge';
import i18n from 'i18n';


const Item = ({ project, current, dispatch }) => {

  const { name, start } = project;

  const handleClick = () => {
    console.log('clicl')
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

  return (
    <div className={classnames({
      item: true,
      'item-active': current === name
    })}
      onClick={() => handleClick()}
    >
      { start && <Badge status="success" /> }
      <i className="iconfont icon-project" />
      <span className="name">{ name }</span>
    </div>
  );
};

export default Item;

