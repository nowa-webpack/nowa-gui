import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import classNames from 'classnames';
import Button from 'antd/lib/button';
import Popconfirm from 'antd/lib/popconfirm';

import i18n from 'i18n-renderer-nowa';
import { COMMAND_SETTING_PAGE } from 'const-renderer-nowa';

const List = ({
  visible,
  onShowModal,
  current: {
    path
  },
  commandSet,
  taskType,
  dispatch
}) => {
  const cmdList = commandSet[path];
  const cmdNames = Object.keys(cmdList).filter(cmd => cmd !== 'start' && cmd !== 'build');

  const stopCmd = (cmd) => {

  };

  const startCmd = (cmd) => {

  };

  const deleteCmd = (cmd) => {
    dispatch({
      type: 'task/deleteCommand',
      payload: { cmd }
    });
  };

  const changeTaskType = (cmd) => {

  };

  const goCmdPage = () => dispatch({
    type: 'layout/showPage',
    payload: { toPage: COMMAND_SETTING_PAGE }
  });

  return (
    <div
      className={classNames({
        'project-commands': true,
        hidden: !visible
      })}
    >
      <h3 className="project-commands-title">{i18n('cmd.sider.title')}</h3>
      <Button
        icon="setting"
        type="dashed"
        shape="circle"
        size="small"
        className="project-commands-btn set"
        onClick={goCmdPage}
      />
      <Button
        icon="plus"
        type="dashed"
        shape="circle"
        size="small"
        className="project-commands-btn add"
        onClick={onShowModal}
      />
      <div className="project-commands-list">
        {
          cmdNames.length > 0 &&
          cmdNames.map(cmd => (
            <div
              className={classNames({
                'project-commands-item': true,
                active: cmd === taskType
              })}
              key={cmd}
              onClick={() => changeTaskType(cmd)}
            >
              {cmd.length > 20 ? cmd.slice(0, 15) + '...' : cmd }
              <Popconfirm
                placement="bottomRight"
                title={i18n('msg.removeTip')}
                onConfirm={() => deleteCmd(cmd)}
                okText={i18n('form.ok')}
                cancelText={i18n('form.cancel')}
              ><i className="iconfont icon-close-o" /></Popconfirm>
              { cmdList[cmd].running
                ? <i className="iconfont icon-pause" onClick={() => stopCmd(cmd)} />
                : <i className="iconfont icon-play" onClick={() => startCmd(cmd)} />
              }
            </div>
          ))
        }
      </div>
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
    // pkg: PropTypes.object.isRequired,
  }).isRequired,
  commandSet: PropTypes.object.isRequired,
  visible: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  onShowModal: PropTypes.func.isRequired,
  taskType: PropTypes.string.isRequired,
};

export default connect(({ project, task }) => ({
  current: project.current,
  commandSet: task.commandSet || {},
  taskType: task.taskType,
}))(List);
