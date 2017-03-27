import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Message from 'antd/lib/message';
import Popconfirm from 'antd/lib/popconfirm';
import Tabs from 'antd/lib/tabs';

import i18n from 'i18n';
import { PORT_MATCH } from 'gui-const';

import BuildConfigForm from './BuildConfigForm';
import ServerConfigForm from './ServerConfigForm';

const TabPane = Tabs.TabPane;

const Setting = ({ dispatch, project }) => {

  const removeProj = () => {
    dispatch({
      type: 'project/remove',
      payload: { project }
    });
  };

  return(
    <div className="setting">
      <Tabs type="card" className="setting-tabs" defaultActiveKey="1">
        <TabPane tab={i18n('project.tab.server')} key="1"><ServerConfigForm /></TabPane>
        <TabPane tab={i18n('project.tab.build')} key="2"><BuildConfigForm /></TabPane>
      </Tabs>
      
    </div>
  );
};

Setting.propTypes = {
  project: PropTypes.shape({
    path: PropTypes.string
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default Setting;

// <Popconfirm
//     placement="bottomRight"
//     title={i18n('msg.removeProject')}
//     onConfirm={removeProj}
//     okText={i18n('form.ok')}
//     cancelText={i18n('form.cancel')}
//   ><Button type="danger" size="small" icon="delete" className="del-btn">{i18n('form.delete')}</Button>
// </Popconfirm>
