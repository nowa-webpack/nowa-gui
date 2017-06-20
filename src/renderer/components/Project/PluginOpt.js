import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import Menu from 'antd/lib/menu';
import Tooltip from 'antd/lib/tooltip';
import Dropdown from 'antd/lib/dropdown';

import i18n from 'i18n-renderer-nowa';
import { LANGUAGE } from 'const-renderer-nowa';

import PluginPromtsModal from './PluginPromtsModal';


class PluginOpt extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      selectPlugin: '',
    };

    this.handleMenuClick = this.handleMenuClick.bind(this);
    this.onHideModal = this.onHideModal.bind(this);
  }

  handleMenuClick({ key }) {
    console.log(key);
    this.setState({ showModal: true, selectPlugin: key });
  }

  onHideModal() {
    this.setState({ showModal: false });
  }

  render() {
    const { plugins, lang } = this.props;
    const { showModal, selectPlugin } = this.state;
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
}

/*const MoreOpt = ({
  pluginList
}) => {
  const files = pluginList.map(name => remote.require(target(name)));
  const lang = config.getItem(LANGUAGE);
  // console.log(files);
  const handleMenuClick = ({ key }) => {
    console.log(key);
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      {
        pluginList.map((name, n) => (
          <Menu.Item key={n}>{files[n].lang[lang]}</Menu.Item>)
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
    </div>
  );
};*/

PluginOpt.propTypes = {
  plugins: PropTypes.arrayOf(PropTypes.object).isRequired,
  lang: PropTypes.string.isRequired,
  // dispatch: PropTypes.func.isRequired,
};

export default connect(({ setting, plugin }) => ({
  lang: setting.lang,
  plugins: plugin.UIPluginList
}))(PluginOpt);