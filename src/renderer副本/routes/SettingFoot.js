import React, { Component } from 'react';
import { shell } from 'electron';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Tooltip from 'antd/lib/tooltip';
import i18n from 'i18n';

import SetDialog from '../components/ProjectList/SetDialog';

class Footer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
    };
    this.toNewPane = this.toNewPane.bind(this);
    this.handleImport = this.handleImport.bind(this);
  }
  toNewPane() {
    const { dispatch } = this.props;

    dispatch({
      type: 'layout/changeStatus',
      payload: {
        showNewProject: true
      }
    });
    dispatch({
      type: 'project/changeStatus',
      payload: {
        current: {}
      }
    });
  }
  handleImport() {
    this.props.dispatch({
      type: 'project/importProj',
      payload: {
        filePath: null
      }
    });
  }
  render() {
    const { showModal } = this.state;
    return (
      <div className="setting-foot">
        <Tooltip placement="bottom" title={i18n('foot.help')} >
          <Button type="default" size="small" shape="circle" onClick={() => shell.openExternal('https://github.com/nowa-webpack/nowa-gui/wiki')} >
            <i className="iconfont icon-help" />
          </Button>
        </Tooltip>
        <Tooltip placement="bottom" title={i18n('foot.feedback')} >
          <Button type="default" size="small" shape="circle" onClick={() => shell.openExternal('https://github.com/nowa-webpack/nowa-gui/issues/new')}>
            <i className="iconfont icon-survey" />
          </Button>
        </Tooltip>
        <Tooltip placement="bottom" title={i18n('foot.set')} >
          <Button type="default" size="small" shape="circle" onClick={() => this.setState({ showModal: true })}>
            <i className="iconfont icon-set" />
          </Button>
        </Tooltip>
        <Tooltip placement="bottom" title={i18n('foot.import')} >
          <Button type="default" size="small" shape="circle" onClick={() => this.handleImport()}>
            <i className="iconfont icon-folder" />
          </Button>
        </Tooltip>
        <Tooltip placement="bottom" title={i18n('foot.add')} >
          <Button type="default" size="small" shape="circle" onClick={() => this.toNewPane()}>
            <i className="iconfont icon-add" />
          </Button>
        </Tooltip>
        <SetDialog 
          visible={showModal} 
          hideDialog={() => {
            this.setState({ showModal: false });
          }}
        />
      </div>
    );
  }
};

export default connect()(Footer);

