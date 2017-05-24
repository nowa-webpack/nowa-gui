import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import Tooltip from 'antd/lib/tooltip';

class TopTaskOpt extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  doAtion = () => {
    const { action, disable } = this.props;

    if (!disable) {
      console.log('do action');
      action();
    }
  }

  render () {
    const { loading } = this.state;
    const { action, name, disable, tip, icon } = this.props;

    // console.log((tip && disable);
    // visible={(tip && disable) || false }

   /* const inner = (
      <div
        className={classNames({
          'project-top-task': true,
          disable
        })}
        onClick={this.doAtion}
      ><i className={`iconfont icon-${icon}`} /><br />{ name }
      </div>
    );

    */

    // const inner = const inner

    const html = (tip && disable) ?
        <Tooltip placement="top" title={tip} >
          <i className={`iconfont icon-${icon}`} /><br />{ name }
        </Tooltip>
        : <span><i className={`iconfont icon-${icon}`} /><br />{ name }</span>;

    return (
      <div
        className={classNames({
          'project-top-task': true,
          disable
        })}
        onClick={this.doAtion}
      >{html}
      </div>
    );
  }
};

TopTaskOpt.propTypes = {
  action: PropTypes.func.isRequired,
  tip: PropTypes.string,
  name: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  disable: PropTypes.bool.isRequired,
};

export default TopTaskOpt;

