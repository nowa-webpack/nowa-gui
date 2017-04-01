import React, { PropTypes } from 'react';
import classnames from 'classnames';
import Badge from 'antd/lib/badge';
import Icon from 'antd/lib/icon';
import Dropdown from 'antd/lib/dropdown';
import Menu from 'antd/lib/menu';
import i18n from 'i18n';

const Item = ({ project, filePath, dispatch }) => {

  const { name, start, taskErr } = project;
  const isActive = filePath === name;

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
        // activeTab: '1'
      }
    });
  };

  const removeProj = () => {
    dispatch({
      type: 'project/remove',
      payload: { project }
    });
  };

  const menu = (
    <Menu onClick={removeProj}>
      <Menu.Item key="1">{i18n('form.delete')}</Menu.Item>
    </Menu>
  );


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
        'item-active': isActive
      })}
      onClick={handleClick}
    >
      { isActive && <Dropdown overlay={menu} trigger={['click']} className="item-down">
       <Icon type="down" />
      </Dropdown> }
      { status }
      <div className="name">{ name }</div>
      
    </div>
  );
};

Item.propTypes = {
  filePath: PropTypes.string,
  project: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default Item;

