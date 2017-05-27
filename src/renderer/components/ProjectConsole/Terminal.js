import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import i18n from 'i18n-renderer-nowa';


class Terminal extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };

  }

  componentWillReceiveProps({ expanded }) {

    // if (expanded !== this.props.expanded) {
    //   this.setState();
    // }
    
  }

  render() {
    const { expanded } = this.props;
    const iconType = expanded ? 'shrink' : 'arrows-alt';
    return (
      <div className="project-terminal">

        <div className="project-terminal-btn expand"
          onClick={() => this.props.onToggle()}
        ><Icon type={iconType} /></div>

        <div className="project-terminal-btn clear"
          onClick={() => {}}
        ><i className="iconfont icon-clear" /></div>

      </div>
    );
  }
}


Terminal.propTypes = {
  current: PropTypes.shape({
    path: PropTypes.string.isRequired,
    pkg: PropTypes.object.isRequired,
  }).isRequired,
  onToggle: PropTypes.func.isRequired,
  // registry: PropTypes.string.isRequired,
  expanded: PropTypes.bool.isRequired,
  // dispatch: PropTypes.func.isRequired,
};

export default connect(({ project, setting, layout }) => ({
  current: project.current,
  // registry: setting.registry,
  // online: layout.online
}))(Terminal);
