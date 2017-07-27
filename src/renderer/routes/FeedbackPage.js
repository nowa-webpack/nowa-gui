/*
  回馈页面
*/
import React, { PropTypes } from 'react';
import Button from 'antd/lib/button';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Col from 'antd/lib/col';

import i18n from 'i18n-renderer-nowa';

const FormItem = Form.Item;

const FeedbackPage = ({
  dispatch,
  form: {
    getFieldDecorator,
    validateFields,
  },
}) => {
  const handleSubmit = () => {
    validateFields((errors, values) => {
      if (errors) {
        return;
      }
      dispatch({
        type: 'layout/sendFeedback',
        payload: values
      });
    });
  };
  const goBack = () => dispatch({ type: 'layout/goBack' });

  return (
    <div className="feedback">
      <h2 className="feedback-title">{i18n('feedback.modal.title')}</h2>
      <Form
        className="ui-form"
        layout="vertical"
      >
        <Col offset={2} span={20}>
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
          <Input type="textarea" rows={4} autosize={false} />
          )}
        </FormItem>
        <FormItem className="ui-form-btns">
          <Button type="primary" size="default" onClick={handleSubmit}>{i18n('form.submit')}</Button>
          <Button type="default" size="default" onClick={goBack}>{i18n('form.back')}</Button>
        </FormItem>
        </Col>
      </Form>
    </div>
  );
};

FeedbackPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
};

export default Form.create()(FeedbackPage);