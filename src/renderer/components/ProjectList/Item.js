import React, { PropTypes } from 'react';
import classnames from 'classnames';
import { shell } from 'electron';
import Badge from 'antd/lib/badge';
import Icon from 'antd/lib/icon';
import Dropdown from 'antd/lib/dropdown';
import Menu from 'antd/lib/menu';
import { confirm } from 'antd/lib/modal';
import { join } from 'path';
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

  const removeProj = ({ key }) => {
    if (key === '1') {
      confirm({
        title: i18n('msg.removeTip'),
        onOk() {
          dispatch({
            type: 'project/remove',
            payload: { project }
          });
        },
        onCancel() {},
        okText: i18n('form.ok'),
        cancelText: i18n('form.cancel'),
      });
    }

    if (key === '2') {
      shell.showItemInFolder(join(project.path, 'package.json'));
    }
  };

  const menu = (
    <Menu onClick={removeProj}>
      <Menu.Item key="1">{i18n('task.remove')}</Menu.Item>
      <Menu.Item key="2">{i18n('task.folder')}</Menu.Item>
    </Menu>
  );
      // { project.hasMod && <Menu.Item key="2">{i18n('form.module')}</Menu.Item> }


  let status;

  if (taskErr) {
    status = <Badge status="warning" />;
  } else if (start) {
    status = <Badge status="processing" />;
  } else {
    status = <Badge status="default" />;
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

