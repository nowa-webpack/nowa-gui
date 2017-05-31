import React, { PropTypes } from 'react';
<<<<<<< HEAD
import { shell } from 'electron';
import Icon from 'antd/lib/icon';
import Menu from 'antd/lib/menu';
import Badge from 'antd/lib/badge';
import Dropdown from 'antd/lib/dropdown';
import { confirm } from 'antd/lib/modal';
import classnames from 'classnames';
import { join } from 'path';

import i18n from 'i18n-renderer-nowa';
import { PROJECT_PAGE } from 'const-renderer-nowa';
import { hidePathString } from 'util-renderer-nowa';


const Item = ({
  project,
  projPath = '',
  dispatch
}) => {
=======
import classnames from 'classnames';
import { shell } from 'electron';
import Badge from 'antd/lib/badge';
import Icon from 'antd/lib/icon';
import Dropdown from 'antd/lib/dropdown';
import Menu from 'antd/lib/menu';
import { confirm } from 'antd/lib/modal';
import { join } from 'path';
import i18n from 'i18n';


const Item = ({ project, projPath, dispatch }) => {

>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
  const { name, path, start, taskErr } = project;
  const isActive = projPath === path;

  const handleClick = () => {
    dispatch({
      type: 'project/changeStatus',
      payload: {
<<<<<<< HEAD
        current: { ...project }
=======
        current: project
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
      }
    });
    dispatch({
      type: 'task/changeStatus',
      payload: {
<<<<<<< HEAD
        taskType: 'start'
=======
        logType: 'start'
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
      }
    });
    dispatch({
      type: 'layout/changeStatus',
      payload: {
<<<<<<< HEAD
        showPage: PROJECT_PAGE,
=======
        showPage: 2,
        // activeTab: '1'
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
      }
    });
  };

<<<<<<< HEAD
  const handleMenuClick = ({ key }) => {
=======
  const removeProj = ({ key }) => {
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
    if (key === '1') {
      confirm({
        title: i18n('msg.removeTip'),
        onOk() {
          dispatch({
            type: 'project/remove',
<<<<<<< HEAD
            payload: project
=======
            payload: { project }
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
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
<<<<<<< HEAD
    <Menu onClick={handleMenuClick}>
=======
    <Menu onClick={removeProj}>
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
      <Menu.Item key="1">{i18n('task.remove')}</Menu.Item>
      <Menu.Item key="2">{i18n('task.folder')}</Menu.Item>
    </Menu>
  );
<<<<<<< HEAD
=======
      // { project.hasMod && <Menu.Item key="2">{i18n('form.module')}</Menu.Item> }

>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9

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
<<<<<<< HEAD
        'project-list-item': true,
        'project-list-item-active': isActive
      })}
      onClick={handleClick}
    >
      { isActive &&
        <Dropdown
          overlay={menu}
          trigger={['click']}
          className="project-list-item-down"
        >
          <Icon type="down" />
        </Dropdown>
      }
      { status }
      <div className="project-list-item-name">{ hidePathString(name, 23) }</div>
=======
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
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
    </div>
  );
};

Item.propTypes = {
  projPath: PropTypes.string,
  project: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default Item;
<<<<<<< HEAD
=======

>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
