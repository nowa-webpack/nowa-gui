import React, { PropTypes } from 'react';
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
