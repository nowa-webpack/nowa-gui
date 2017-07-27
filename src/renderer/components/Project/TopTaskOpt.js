/*
  基本操作块子组件
*/
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import Tooltip from 'antd/lib/tooltip';

import { throttle } from 'shared-nowa';

const TopTaskOpt = ({
  action,
  tip,
  name,
  icon,
  disable,
}) => {
  const doAtion = () => {
    if (!disable) {
      action();
    }
  };

  const html = (tip && disable)
      ? (<Tooltip placement="top" title={tip} >
          <i className={`iconfont icon-${icon}`} /><br />{ name }
        </Tooltip>)
      : <span><i className={`iconfont icon-${icon}`} /><br />{ name }</span>;

  return (
    <div
      className={classNames({
        'project-top-task': true,
        disable
      })}
      onClick={throttle(doAtion, 300)}
    >{html}
    </div>
  );
};


TopTaskOpt.propTypes = {
  action: PropTypes.func.isRequired,
  tip: PropTypes.string,
  name: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  disable: PropTypes.bool.isRequired,
};

export default TopTaskOpt;

