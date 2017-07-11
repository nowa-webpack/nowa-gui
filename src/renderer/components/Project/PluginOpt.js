import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import Menu from 'antd/lib/menu';
import Tooltip from 'antd/lib/tooltip';
import Dropdown from 'antd/lib/dropdown';

import i18n from 'i18n-renderer-nowa';
import { LANGUAGE } from 'const-renderer-nowa';

import PluginPromtsModal from './PluginPromtsModal';

const PluginOpt = ({
  plugins,
  lang,
  showModal,
  dispatch,
}) => {

  const handleMenuClick = ({ key }) => {
    console.log(key);
    dispatch({
      type: 'plugin/execPretask',
      payload: {
        name: key,
      }
    });
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      {
        plugins.map(({ name, plugin }) => (
          <Menu.Item key={name}>{plugin.name[lang]}</Menu.Item>)
        )
        // plugins.map(({ name }) => (
        //   <Menu.Item key={name}>{name}</Menu.Item>)
        // )
      }
    </Menu>
  );

  return (
    <div className="project-top-task">
      <Dropdown
          overlay={menu}
          trigger={['hover']}
          className="project-top-task-list"
        >
        <span>
          <i className="iconfont icon-more" />
          <br/>
          {i18n('task.more')}
        </span>
      </Dropdown>
      { showModal && <PluginPromtsModal/> }
    </div>
  );
};

PluginOpt.propTypes = {
  plugins: PropTypes.arrayOf(PropTypes.object).isRequired,
  lang: PropTypes.string.isRequired,
  showModal: PropTypes.bool.isRequired,
  
};

export default connect(({ setting, plugin, project }) => ({
  lang: setting.lang,
  plugins: plugin.UIPluginList,
  showModal: plugin.showPromtsModal,
}))(PluginOpt);