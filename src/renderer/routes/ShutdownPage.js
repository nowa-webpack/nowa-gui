/*
  关闭页面
  断网又无nowa依赖的情况下进入此页面
*/
import React, { Component } from 'react';
import { remote } from 'electron';
import Icon from 'antd/lib/icon';

import i18n from 'i18n-renderer-nowa';
import { removeLoading } from 'util-renderer-nowa';

class ShutdownPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      seconds: 5
    };
    this.shutdownTimer;
  }

  componentDidMount() {
    removeLoading();
    this.shutdownTimer = setInterval(() => {
      const { seconds } = this.state;
      if (seconds === 1) {
        clearInterval(this.shutdownTimer);
        remote.app.quit();
      } else {
        this.setState({ seconds: seconds - 1 });
      }
    }, 1000);
  }

  render () {
    const { seconds } = this.state;

    return (
      <div className="shutdown">
        <div className="shutdown-content">
          <Icon type="info-circle-o" />
          <p className="shutdown-detail">{i18n('preinit.msg1')}</p>
          <p>{i18n('preinit.msg2', seconds)}</p>
        </div>
      </div>
    );
  }
}

export default ShutdownPage;
