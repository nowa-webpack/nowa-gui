import React, { PropTypes } from 'react';
<<<<<<< HEAD
import Button from 'antd/lib/button';
import { connect } from 'dva';
import i18n from 'i18n-renderer-nowa';
import { BOILERPLATE_PAGE } from 'const-renderer-nowa';

const WelcomePage = ({ version, dispatch }) => {
  const handleImport = () => dispatch({
    type: 'projectCreate/folderImport',
    payload: { projPath: null }
  });
=======
import { remote } from 'electron';
import { join } from 'path'
import Button from 'antd/lib/button';
import i18n from 'i18n';

import { readPkgJson, getPkgDependencies } from 'gui-util';

const { command } = remote.getGlobal('services');
// const { registry } = remote.getGlobal('config');


const WelcomePage = ({ version, dispatch }) => {
  const handleImport = () => {
    try {

      dispatch({
        type: 'project/importProjectFromFolder',
        payload: { filePath: null, needInstall: true },
      });
      
    } catch (e) {
      console.log(e);
    }
  };
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9

  const toNewPage = () => {
    dispatch({
      type: 'layout/changeStatus',
      payload: {
<<<<<<< HEAD
        showPage: BOILERPLATE_PAGE
=======
        showPage: 1
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
      }
    });
  };

  return (
    <div className="welcome">
<<<<<<< HEAD
      <div className="welcome-bg" />
      <div className="welcome-version">V{version}</div>
      <p className="welcome-description">{i18n('welcome.description')}</p>
      <div className="welcome-btns">
        <Button type="default" size="large" onClick={() => toNewPage()}>{i18n('welcome.create')}</Button><br />
        <Button type="default" size="large" onClick={() => handleImport()}>{i18n('welcome.import')}</Button>
      </div>
=======
      <div className="bg" />
      <div className="version">V{version}</div>
      <p className="desp">{i18n('welcome.description')}</p>
      <Button type="default" size="large" onClick={() => toNewPage()}>{i18n('welcome.create')}</Button><br />
      <Button type="default" size="large" onClick={() => handleImport()}>{i18n('welcome.import')}</Button>
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
    </div>
  );
};

WelcomePage.propTypes = {
  version: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
};

<<<<<<< HEAD
export default connect(({ layout }) => ({
  version: layout.version,
}))(WelcomePage);
=======
export default WelcomePage;
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
