import React, {Component} from 'react';
// import { connect } from 'dva';
import classnames from 'classnames';
import Button from 'antd/lib/button';
import Badge from 'antd/lib/badge';
import i18n from 'i18n';


const Item = ({ project, current, dispatch }) => {

  const { name, start } = project;

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
        showConfig: true
      }
    });
  };

  return (
    <div className={classnames({
      item: true,
      'item-active': current === name
    })}
      onClick={handleClick}
    >
      { start && <Badge status="success" /> }
      <i className="iconfont icon-project" />
      <span className="name">{ name }</span>
    </div>
  );
};

export default Item;

