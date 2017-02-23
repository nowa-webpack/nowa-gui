import React from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Message from 'antd/lib/message';
import Modal from 'antd/lib/modal';
import Select from 'antd/lib/select';
import i18n from 'i18n';

const storage = window.localStorage;
const DEFAULT_LANGUAGE = storage.getItem('LANGUAGE');

const SetDialog = ({ layout, visible, hideDialog, dispatch }) => {
  let language = storage.getItem('LANGUAGE');

  const handleOk = () => {
    if (language !== DEFAULT_LANGUAGE) {
      storage.setItem('LANGUAGE', language);
      window.location.reload();
    }
    hideDialog();
  };

  const changeLanguage = (value) => {
    language = value;
  };

  return (
    <Modal 
      title={i18n('setting.modal.title')}
      visible={visible}
      onOk={handleOk} 
      onCancel={hideDialog}
      wrapClassName="set-modal"
      okText={i18n('form.ok')}
      cancelText={i18n('form.cancel')}
    >
      <form className="form-inline" >
        <div className="form-item">
          <label>{i18n('setting.language')}</label>
          <Select
            style={{ width: 250 }}
            defaultValue={language}
            onChange={changeLanguage}
          >
            <Select.Option value={'en'}>{i18n('setting.language.en')}</Select.Option>
            <Select.Option value={'zh'}>{i18n('setting.language.zh')}</Select.Option>
          </Select>
        </div>
        <div className="form-item">
          <label>{i18n('setting.version')}</label>
          <span className="version">
            {layout.version} 
            {!layout.shouldAppUpdate && ` (${i18n('setting.version.newest.tip')})`}
          </span>
          {
            layout.shouldAppUpdate && 
            <Button type="ghost" size="small" shape="circle"
              onClick={() => dispatch({
                type: 'layout/upgrade'
              })}>
              <i className="iconfont icon-update"/></Button>
          }
        </div>
      </form>
    </Modal>
  );
};

export default connect(({ layout }) => ({ layout }))(SetDialog);
