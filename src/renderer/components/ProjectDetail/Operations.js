import React, {Component} from 'react';
import { connect } from 'dva';
// import { hashHistory } from 'react-router';
import Button from 'antd/lib/button';
import { shell } from 'electron';
import Tooltip from 'antd/lib/tooltip';
import Popconfirm from 'antd/lib/popconfirm';
import i18n from 'i18n';

const ButtonGroup = Button.Group;

const Operation = ({ project, dispatch }) => {
  const startBtn = project.start
  ? <Tooltip placement="bottom" title={i18n('project-item.stop.btn')} >
      <Button
        type="primay"
        size="small"
        onClick={() => dispatch({
          type: 'task/stop',
          payload: { project }
        })}
      >
        <i className="iconfont icon-stop" />
      </Button>
    </Tooltip>
  : <Tooltip placement="bottom" title={i18n('project-item.start.btn')} >
      <Button
        type="ghost"
        size="small"
        onClick={() => dispatch({
          type: 'task/start',
          payload: { project }
        })}
      >
        <i className="iconfont icon-start" />
      </Button>
    </Tooltip>;

  return (
    <ButtonGroup className="btn-grp">
      { startBtn }
      { project.start &&
        <Tooltip placement="bottom" title={i18n('project-item.browser.btn')}>
          <Button type="ghost" size="small">
          <i className="iconfont icon-browse" />
          </Button>
        </Tooltip>
      }
      <Tooltip placement="bottom" title={i18n('project-item.compile.btn')}>
        <Button type="ghost" size="small"
          onClick={() => dispatch({
            type: 'task/build',
            payload: { project }
          })}
        >
          <i className="iconfont icon-compare" />
        </Button>
      </Tooltip>
      <Tooltip placement="bottom" title={i18n('project-item.folder.btn')}>
        <Button
          type="ghost" size="small"
          onClick={() => shell.showItemInFolder(project.path)}
        ><i className="iconfont icon-folder" />
        </Button>
      </Tooltip>
      <Popconfirm
        placement="bottomRight"
        title={'Are you sure remove this project?'}
        onConfirm={() => dispatch({
          type: 'project/remove',
          payload: { project }
        })}
        okText="Yes"
        cancelText="No"
      >
       <Button type="ghost" size="small"><i className="iconfont icon-delete" /></Button>
      </Popconfirm>
    </ButtonGroup>
  );
};

export default connect()(Operation);
// export default connect(({ project  }) => ({ config: project.current  }))(Operation);
