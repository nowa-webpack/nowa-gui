import React, { PropTypes } from 'react';
import i18n from 'i18n';

const DragPage = () => {
  return (
    <div className="drag" id="drag-ctn" style={{ display: 'none' }}>
      <div className="content">
        <div><i className="iconfont icon-import" /></div>
        <div className="detail">{i18n('welcome.description')}</div>
        <div>{i18n('welcome.notice')}</div>
      </div>
    </div>
  );
};

export default DragPage;
