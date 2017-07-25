import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import Col from 'antd/lib/col';
import Row from 'antd/lib/row';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Switch from 'antd/lib/switch';
import Button from 'antd/lib/button';
import Tooltip from 'antd/lib/tooltip';

import i18n from 'i18n-renderer-nowa';
import { openUrl } from 'util-renderer-nowa';


const FormItem = Form.Item;
const inlineFormItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
};

class BuildForm extends Component {
  constructor(props) {
    super(props);
    this.state = this.getInitState(props.current.abc);
  }

  componentWillReceiveProps({ current }) {
    const { abc, path } = current;
    if (path !== this.props.current.path) {
      const newState = this.getInitState(abc);
      this.setState(newState);
      this.props.form.setFieldsValue({
        ...newState,
      });
    }
  }

  getInitState (abc) {
    const state = {
      dist: typeof abc.dist === 'undefined' ? 'dist' : abc.dist,
      mangle: typeof abc.mangle === 'undefined' ? false : abc.mangle,
      keepconsole: typeof abc.keepconsole === 'undefined' ? false : abc.keepconsole,
      exportcss: typeof abc.exportcss === 'undefined' ? true : abc.exportcss,
      skipminify: typeof abc.skipminify === 'undefined' ? false : abc.skipminify,
      analyse: typeof abc.analyse === 'undefined' ? false : abc.analyse,
    };

    if (!state.skipminify) {
      state.minifyExtension = abc.minifyExtension || '';
    } else {
      state.minifyExtension = '';
    }

    return state;
  }

  handleSubmit = () => {
    const { form, dispatch, current } = this.props;
    form.validateFields((err, data) => {
      if (!err) {
        console.log(data);
        const abc = { ...current.abc, ...data };
        dispatch({
          type: 'project/updateABCJson',
          payload: { project: current, abc }
        });
      }
    });
  }

  changeSkipminify = (skipminify) => {
    this.props.form.setFieldsValue({
      skipminify
    });
    this.setState({ skipminify });
  }

  render () {
    const { getFieldDecorator } = this.props.form;
    const { mangle, keepconsole, exportcss, skipminify, minifyExtension, dist, analyse } = this.state;

    return (
      <Form className="setting-form">
        <Row className="setting-form-inline">
          <Col span="12" offset="0">
            <FormItem
              {...inlineFormItemLayout}
              label="Mangle"
            >{getFieldDecorator('mangle', {
              initialValue: mangle,
              valuePropName: 'checked'
            })(<Switch size="default" />)}
            </FormItem>
            
            <FormItem
              {...inlineFormItemLayout}
              label="Skipminify"
            >{getFieldDecorator('skipminify', {
              initialValue: skipminify,
              valuePropName: 'checked',
              onChange: this.changeSkipminify,
            })(<Switch size="default" />)}
            </FormItem>
            <FormItem
              {...inlineFormItemLayout}
              label="MinifyExtension"
            >{getFieldDecorator('minifyExtension', {
              initialValue: minifyExtension,
            })(<Input disabled={skipminify} />)}
            </FormItem>
            <FormItem
              {...inlineFormItemLayout}
              label="Dist"
            >{getFieldDecorator('dist', {
              initialValue: dist,
            })(<Input />)}
            </FormItem>
          </Col>
          <Col span="12" offset="0">
            <FormItem
              {...inlineFormItemLayout}
              label="Analyse"
            >{getFieldDecorator('analyse', {
              initialValue: analyse,
              valuePropName: 'checked'
            })(<Switch size="default" />)}
            </FormItem>
            <FormItem
              {...inlineFormItemLayout}
              label="Keepconsole"
            >{getFieldDecorator('keepconsole', {
              initialValue: keepconsole,
              valuePropName: 'checked'
            })(<Switch size="default" />)}
            </FormItem>
            
            <FormItem
              {...inlineFormItemLayout}
              label="Exportcss"
            >{getFieldDecorator('exportcss', {
              initialValue: exportcss,
              valuePropName: 'checked'
            })(<Switch size="default" />)}
            </FormItem>
            
          </Col>
         
        </Row>
        <Tooltip placement="top" title={i18n('foot.help')} >
          <Button type="primary" icon="question" shape="circle" size="small" ghost
            className="project-setting-help"
            onClick={() => openUrl('https://nowa-webpack.github.io/docs/xiang_mu_gou_jian.html')}
          />
        </Tooltip>
        <FormItem wrapperCol={{ offset: 4 }} className="setting-form-btns">
          <Button
            type="primary"
            size="default"
            onClick={this.handleSubmit}
          >{i18n('form.submit')}</Button>
        </FormItem>
      </Form>
    );
  }
}


BuildForm.propTypes = {
  current: PropTypes.shape({
    abc: PropTypes.object,
    path: PropTypes.string,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
  form: PropTypes.shape({
    getFieldDecorator: PropTypes.func,
    setFieldsValue: PropTypes.func,
    validateFields: PropTypes.func,
  }).isRequired,
};

export default Form.create()(connect(({ project }) => ({
  current: project.current,
}))(BuildForm));
