import React, { PropTypes } from 'react';
import Tooltip from 'antd/lib/tooltip';
import Button from 'antd/lib/button';

import i18n from 'i18n-renderer-nowa';
import { SETTING_PAGE, FEEDBACL_PAGE } from 'const-renderer-nowa';
import { openUrl } from 'util-renderer-nowa';


const SiderFoot = ({ dispatch }) => {
  const gotoPage = toPage => dispatch({ type: 'layout/showPage', payload: { toPage } });

  return (
    <div className="main-foot">
      <div className="main-foot-bg">
      <Tooltip placement="top" title={i18n('foot.set')} >
        <Button type="default" icon="setting" shape="circle"
          onClick={() => gotoPage(SETTING_PAGE)}
        />
      </Tooltip>
      <Tooltip placement="top" title={i18n('foot.issue')} >
        <Button type="default" icon="github" shape="circle"
          onClick={() => openUrl('https://github.com/nowa-webpack/nowa-gui/issues/new')}
        />
      </Tooltip>
      <Tooltip placement="top" title={i18n('foot.feedback')} >
        <Button type="default" icon="dingding" shape="circle"
          onClick={() => gotoPage(FEEDBACL_PAGE)}
        />
      </Tooltip>
      <Tooltip placement="top" title={i18n('foot.help')} >
        <Button type="default" icon="question-circle-o" shape="circle"
          onClick={() => openUrl('https://nowa-webpack.github.io/nowa/')}
        />
      </Tooltip>
      </div>
    </div>
  );
};

SiderFoot.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default SiderFoot;