import React from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Message from 'antd/lib/message';
import Modal from 'antd/lib/modal';
import Select from 'antd/lib/select';
import i18n from 'i18n';

const storage = window.localStorage;
const DEFAULT_LANGUAGE = storage.getItem('LANGUAGE');

const SetDialog = ({ visible, hideDialog }) => {
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
      title="Setting Modal" 
      visible={visible}
      onOk={handleOk} 
      onCancel={hideDialog}
      wrapClassName="set-modal"
    >
      <form className="form-inline" >
        <div className="form-item">
          <label>Language</label>
          <Select
            style={{ width: 250 }}
            defaultValue={language}
            onChange={changeLanguage}
          >
            <Select.Option value={'en'}>English</Select.Option>
            <Select.Option value={'zh'}>Chinese</Select.Option>
          </Select>
        </div>
      </form>
    </Modal>
  );
};

export default SetDialog;
