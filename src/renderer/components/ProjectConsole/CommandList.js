import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import classNames from 'classnames';
import Button from 'antd/lib/button';
import Popconfirm from 'antd/lib/popconfirm';

import i18n from 'i18n-renderer-nowa';

const List = ({
  visible,
  onShowModal
}) => {
  return (
    <div
      className={classNames({
        'project-commands': true,
        hidden: !visible
      })}
    >
    <h3 className="project-commands-title">{i18n('cmd.sider.title')}</h3>
    <Button ghost
      icon="plus"
      type="primary"
      shape="circle"
      size="small"
      className="project-commands-add"
      onClick={onShowModal}
    />
    </div>
  );
};


/*class List extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };

  }

  componentWillReceiveProps() {
    
  }

  render() {
    const { visible } = this.props;
    return (
      <div
        className={classNames({
          'project-commands': true,
          'visible': !visible,
        })}
      >
      </div>
    );
  }
}*/


List.propTypes = {
  current: PropTypes.shape({
    path: PropTypes.string.isRequired,
    pkg: PropTypes.object.isRequired,
  }).isRequired,
  // registry: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  onShowModal: PropTypes.func.isRequired,
};

export default connect(({ project, setting, layout }) => ({
  current: project.current,
  // registry: setting.registry,
  // online: layout.online
}))(List);
