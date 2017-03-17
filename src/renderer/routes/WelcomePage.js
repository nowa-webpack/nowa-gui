import React, { PropTypes } from 'react';
import Button from 'antd/lib/button';
import i18n from 'i18n';

const WelcomePage = ({ version, dispatch }) => {
  const handleImport = () => {
    dispatch({
      type: 'project/importProj',
      payload: {
        filePath: null,
        needInstall: true
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
      <p className="desp">{i18n('welcome.description')}</p>
      <Button type="default" size="large" onClick={() => toNewPage()}>{i18n('welcome.create')}</Button><br />
      <Button type="default" size="large" onClick={() => handleImport()}>{i18n('welcome.import')}</Button>
    </div>
  );
};

WelcomePage.propTypes = {
  version: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default WelcomePage;
