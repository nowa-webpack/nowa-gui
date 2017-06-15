import React from 'react';
import i18n from 'i18n-renderer-nowa';

const DragPage = () =>
  <div className="drag" id="drag-ctn" style={{ display: 'none' }}>
    <div className="drag-content">
      <div><i className="iconfont icon-import" /></div>
      <div className="drag-detail">{i18n('welcome.description')}</div>
    </div>
  </div>;

export default DragPage;