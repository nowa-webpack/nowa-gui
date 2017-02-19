import React, {Component} from 'react';
import { connect } from 'dva';
import { remote } from 'electron';
import i18n from 'i18n';


import TemplateList from '../components/Welcome/TemplateList';
import TemplateForm from '../components/Welcome/TemplateForm';
import InstallLog from '../components/Welcome/InstallLog';


// const { config } = remote.getGlobal('configs');

const Welcome = ({ init: { templates, loading, term }, showForm, showLog, dispatch }) => {
  const listProps = {
    templates,
    loading,
    dispatch
  };

  const logProps = {
    dispatch,
    term
  };

  let html;
  if (showForm) {
    html = <TemplateForm />;
  } else if (showLog) {
    html = <InstallLog {...logProps} />;
  } else {
    html = <TemplateList {...listProps} />;
  }

  return html;
};

export default connect(({ init, layout }) => ({
  init,
  showForm: layout.showCreateForm,
  showLog: layout.showInstallLog
}))(Welcome);
