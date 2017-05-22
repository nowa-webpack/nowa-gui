import React, { PropTypes, Component } from 'react';
import Button from 'antd/lib/button';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Col from 'antd/lib/col';

import i18n from 'i18n-renderer-nowa';

const FormItem = Form.Item;

class FeedbackPage extends Component {
  // constructor(props) {
  //   super(props);
  // }

  handleSubmit() {
    const that = this;
    const { dispatch, form } = that.props;
    form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        dispatch({
          type: 'layout/sendFeedback',
          payload: values
        });
      }
    });
  }

  goBack() {
    this.props.dispatch({ type: 'layout/goBack' });
  }

  render() {
    // const { nickname, contact, content } = this.state;
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="feedback">
        <h2 className="feedback-title">{i18n('feedback.modal.title')}</h2>
        <Form
          className="ui-form"
          layout="vertical"
        >
          <Col offset={3}>
          <FormItem
            label={i18n('feedback.name')}
          >
          {getFieldDecorator('nickname', {
            rules: [
              { required: true, message: i18n('msg.nameRequired') },
            ],
          })(
            <Input placeholder="Nickname" />
            )}
          </FormItem>
          <FormItem
            label={i18n('feedback.contact')}
          >
          {getFieldDecorator('contact', {
            rules: [
              { required: true, message: i18n('msg.contactRequired') },
            ],
          })(
            <Input placeholder="Email, Phone number" />
            )}
          </FormItem>
          <FormItem
            label={i18n('feedback.content')}
          >
          {getFieldDecorator('content', {
            rules: [
              { required: true, message: i18n('msg.contentRequired') },
            ],
          })(
            <Input type="textarea" rows={4} />
            )}
          </FormItem>
          <FormItem className="ui-form-btns">
            <Button type="primary" onClick={() => this.handleSubmit()}>{i18n('form.submit')}</Button>
            <Button type="default" onClick={() => this.goBack()}>{i18n('form.back')}</Button>
          </FormItem>
          </Col>
        </Form>
      </div>
    );
  }
}

FeedbackPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
};

export default Form.create()(FeedbackPage);