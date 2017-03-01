import React from 'react';
import Button from 'antd/lib/button';

const DragPage = ({ version, dispatch }) => {
  const handleImport = () => {
    dispatch({
      type: 'project/importProj',
      payload: {
        filePath: null
      }
    });
  };

  const toNewPage = () => {
    dispatch({
      type: 'layout/changeStatus',
      payload: {
        showPage: 2
      }
    });
  };

  return (
    <div className="drag" id="drag-ctn" style={{ display: 'none'}}>
      <div className="content">
        <div><i className="iconfont icon-import"/></div>
        <div className="detail">将项目文件夹拖动到这里进行导入</div>
        <div >仅支持之前使用Nowa工具创建的项目文件夹</div>
      </div>
    </div>
    );
};

export default DragPage;