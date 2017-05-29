import React, { PropTypes, Component } from 'react';
import { remote } from 'electron';
import Button from 'antd/lib/button';
import Select from 'antd/lib/select';
import Radio from 'antd/lib/radio';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';
import { connect } from 'dva';

import i18n from 'i18n-renderer-nowa';


const FormItem = Form.Item;


class CommandSettingPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  
  handleSubmit = () => {
    // const that = this;
    // const { dispatch, form } = that.props;
    // form.validateFields((err, values) => {
    //   if (!err) {
    //     console.log('Received values of form: ', values);
    //     dispatch({
    //       type: 'setting/setValues',
    //       payload: {
    //         ...values,
    //         editor: that.editor,
    //       }
    //     });
    //   }
    // });
  }

  goBack() {
    this.props.dispatch({ type: 'layout/goBack' });
  }

  render() {

    return (
      <div className="setting">
        <h2 className="setting-title">{i18n('全局命令设置')}</h2>
        <p>在此设置的命令会应用于所有的项目</p>
        <Form
          className="ui-form"
          layout="horizontal"
        >
          
          <FormItem wrapperCol={{ offset: 6 }} className="ui-form-btns">
            <Button type="primary" size="default" onClick={() => this.handleSubmit()}>{i18n('form.submit')}</Button>
            <Button type="default" size="default" onClick={() => this.goBack()}>{i18n('form.back')}</Button>
          </FormItem>
        </Form>
       
      </div>
    );
  }
}

CommandSettingPage.propTypes = {
  defaultCommandSet: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  form: PropTypes.shape({
    getFieldDecorator: PropTypes.func,
    setFieldsValue: PropTypes.func,
    validateFields: PropTypes.func,
  }).isRequired,
  // editor: PropTypes.shape({
  //   Sublime: PropTypes.string,
  //   VScode: PropTypes.string
  // }).isRequired
};

export default Form.create()(connect(({ task }) => ({
  defaultCommandSet: task.defaultCommandSet || {},
}))(CommandSettingPage));

