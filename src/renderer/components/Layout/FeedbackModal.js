import React, { Component, PropTypes } from 'react';
import Message from 'antd/lib/message';
import Modal from 'antd/lib/modal';
import i18n from 'i18n';

import request from 'gui-request';
import { DINGDING_TOKEN } from 'gui-const';

class FeedbackModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nickname: '',
      contact: '',
      content: '',
    };

    this.hideModal = this.hideModal.bind(this);
  }


  hideModal() {
    this.props.dispatch({ type: 'layout/changeStatus', payload: { showFeedBackModal: false } });
  }

  handleOk() {
    const that = this;
    const { nickname, contact, content } = that.state;
    const { version } = this.props;

    if (!nickname) {
      Message.error(i18n('msg.nameRequired'));
      return false;
    }
    if (!contact) {
      Message.error(i18n('msg.contactRequired'));
      return false;
    }
    if (!content) {
      Message.error(i18n('msg.contentRequired'));
      return false;
    }
    request(`https://oapi.dingtalk.com/robot/send?access_token=${DINGDING_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        msgtype: 'markdown',
        markdown: {
          title: '来自用户的反馈',
          text: '### Name\n' +
                `${nickname}\n` +
                '### Contact\n' +
                `${contact}\n` +
                '### Feedback\n' +
                `${content}\n` +
                '### Version\n' +
                `${version}\n` +
                '### OS\n' +
                `${process.platform}\n`
        }
      })
    }).then(({ data }) => {
      if (data.errcode === 0) {
        that.hideModal();
      } else {
        Message.error(data.errmsg);
      }
    });
  }

  

  render() {
    const { nickname, contact, content } = this.state;
    const { showModal } = this.props;
    return (
      <Modal
        title={i18n('feedback.modal.title')}
        visible={showModal}
        onOk={() => this.handleOk()} 
        onCancel={() => this.hideModal()}
        wrapClassName="set-modal"
        okText={i18n('form.ok')}
        cancelText={i18n('form.cancel')}
        style={{ top: 70 }}
      >
        <form className="ui-form" style={{ paddingLeft: 80 }}>
          <div className="form-item">
            <label className="form-label-bk">{i18n('feedback.name')}</label>
            <input type="text" className="lg" value={nickname}
              onChange={e => this.setState({ nickname: e.target.value })}
            />
          </div>
          <div className="form-item">
            <label className="form-label-bk">{i18n('feedback.contact')}</label>
            <input type="text" className="lg" value={contact}
              placeholder="phone, email"
              onChange={e => this.setState({ contact: e.target.value })}
            />
          </div>
          <div className="form-item">
            <label className="form-label-bk">{i18n('feedback.content')}</label>
            <textarea value={content}
              onChange={e => this.setState({ content: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    );
  }
}

FeedbackModal.propTypes = {
  dispatch: PropTypes.func.isRequired,
  showModal: PropTypes.bool.isRequired,
  version: PropTypes.string.isRequired,
};

export default FeedbackModal;
