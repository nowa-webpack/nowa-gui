import React, { PropTypes, Component } from 'react';
import Button from 'antd/lib/button';
// import Message from 'antd/lib/message';

import i18n from 'i18n-renderer-nowa';
import { msgError } from 'util-renderer-nowa';

class FeedbackPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nickname: '',
      contact: '',
      content: '',
    };
  }

  handleSubmit() {
    const { nickname, contact, content } = this.state;

    if (!nickname) {
      msgError(i18n('msg.nameRequired'));
      return false;
    }
    if (!contact) {
      msgError(i18n('msg.contactRequired'));
      return false;
    }
    if (!content) {
      msgError(i18n('msg.contentRequired'));
      return false;
    }
    console.log(nickname, contact, content);
    this.props.dispatch({
      type: 'layout/sendFeedback',
      payload: this.state
    });
    
  }

  goBack() {
    this.props.dispatch({ type: 'layout/goBack' });
  }

  render() {
    const { nickname, contact, content } = this.state;

    return (
      <div className="feedback">
        <h2 className="feedback-title">{i18n('feedback.modal.title')}</h2>
        <form className="ui-form">
          <div className="ui-form-item">
            <label className="ui-form-label-horizon">{i18n('feedback.name')}</label>
            <input type="text" className="mx" value={nickname}
              onChange={e => this.setState({ nickname: e.target.value })}
            />
          </div>
          <div className="ui-form-item">
            <label className="ui-form-label-horizon">{i18n('feedback.contact')}</label>
            <input type="text" className="mx" value={contact}
              placeholder="phone, email"
              onChange={e => this.setState({ contact: e.target.value })}
            />
          </div>
          <div className="ui-form-item">
            <label className="ui-form-label-horizon">{i18n('feedback.content')}</label>
            <textarea value={content}
              onChange={e => this.setState({ content: e.target.value })}
            />
          </div>
          <div className="ui-form-btns">
            <Button type="primary" onClick={() => this.handleSubmit()}>{i18n('form.submit')}</Button>
            <Button type="default" onClick={() => this.goBack()}>{i18n('form.back')}</Button>
          </div>
        </form>
      </div>
    );
  }
}

FeedbackPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default FeedbackPage;