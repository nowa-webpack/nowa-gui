<<<<<<< HEAD
import React from 'react';
import i18n from 'i18n-renderer-nowa';

const DragPage = () =>
  <div className="drag" id="drag-ctn" style={{ display: 'none' }}>
    <div className="drag-content">
      <div><i className="iconfont icon-import" /></div>
      <div className="drag-detail">{i18n('welcome.description')}</div>
    </div>
  </div>;
=======
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
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9

export default DragPage;
