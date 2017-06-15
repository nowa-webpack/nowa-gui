import React, { PropTypes } from 'react';
import Button from 'antd/lib/button';
import { connect } from 'dva';
import i18n from 'i18n-renderer-nowa';
import { BOILERPLATE_PAGE } from 'const-renderer-nowa';

const WelcomePage = ({ version, dispatch }) => {
  const handleImport = () => dispatch({
    type: 'projectCreate/folderImport',
    payload: { projPath: null }
  });

  const toNewPage = () => {
    dispatch({
      type: 'layout/changeStatus',
      payload: {
        showPage: BOILERPLATE_PAGE
      }
    });
  };

  return (
    <div className="welcome">
      <div className="welcome-bg" />
      <div className="welcome-version">V{version}</div>
      <p className="welcome-description">{i18n('welcome.description')}</p>
      <div className="welcome-btns">
        <Button type="default" size="large" onClick={() => toNewPage()}>{i18n('welcome.create')}</Button><br />
        <Button type="default" size="large" onClick={() => handleImport()}>{i18n('welcome.import')}</Button>
      </div>
    </div>
  );
};

WelcomePage.propTypes = {
  version: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect(({ layout }) => ({
  version: layout.version,
}))(WelcomePage);