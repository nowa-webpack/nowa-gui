import React from 'react';
import Button from 'antd/lib/button';

const WelcomePage = ({ version, dispatch }) => {
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
        showPage: 1
      }
    });
  };

  return (
    <div className="welcome">
      <div className="bg" />
      <div className="version">V{version}</div>
      <Button type="default" size="large" onClick={() => toNewPage()}>Create New Project</Button><br />
      <Button type="default" size="large" onClick={() => handleImport()}>Import Project</Button>
    </div>
    );
};

export default WelcomePage;
