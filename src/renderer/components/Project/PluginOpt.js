import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import Menu from 'antd/lib/menu';
import Tooltip from 'antd/lib/tooltip';
import Dropdown from 'antd/lib/dropdown';

import i18n from 'i18n-renderer-nowa';
import { LANGUAGE } from 'const-renderer-nowa';

import PluginPromtsModal from './PluginPromtsModal';

/*
class PluginOpt extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectPlugin: '',
    };

    this.handleMenuClick = this.handleMenuClick.bind(this);
  }

  handleMenuClick({ key }) {
    console.log(key);
    this.props.dispatch({
      type: 'plugin/execPretask',
      payload: key
    });
    this.setState({ selectPlugin: key });
  }
  render() {
    const { plugins, lang, showModal } = this.props;
    const { selectPlugin } = this.state;
    const menu = (
      <Menu onClick={this.handleMenuClick}>
        {
          plugins.map(({ name, file }) => (
            <Menu.Item key={name}>{file.name[lang]}</Menu.Item>)
          )
        }
      </Menu>
    );

    let plugin = {};

    if (selectPlugin) {
      plugin = plugins.filter(item => item.name === selectPlugin)[0];
    }

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
        { showModal &&
          <PluginPromtsModal
            data={plugin}
            onHideModal={this.onHideModal}
            showModal={showModal}
            lang={lang}
          />
        }
      </div>
    );
  }
}*/

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
      payload: key 
    });
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      {
        plugins.map(({ name, file }) => (
          <Menu.Item key={name}>{file.name[lang]}</Menu.Item>)
        )
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
  // current: PropTypes.shape({
  //   name: PropTypes.string,
  //   path: PropTypes.string,
  // }).isRequired,
  // dispatch: PropTypes.func.isRequired,
};

export default connect(({ setting, plugin, project }) => ({
  lang: setting.lang,
  plugins: plugin.UIPluginList,
  showModal: plugin.showPromtsModal,
  // current: project.current,
}))(PluginOpt);