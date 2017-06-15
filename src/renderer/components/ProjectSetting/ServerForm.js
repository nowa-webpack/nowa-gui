import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import Tooltip from 'antd/lib/tooltip';
import Col from 'antd/lib/col';
import Row from 'antd/lib/row';
import Select from 'antd/lib/select';
import Switch from 'antd/lib/switch';
import Form from 'antd/lib/form';

import i18n from 'i18n-renderer-nowa';
import { openUrl } from 'util-renderer-nowa';


const FormItem = Form.Item;

const inlineFormItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
};

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 14 },
};

class ServerForm extends Component {
  constructor(props) {
    super(props);
    // this.state = this.getInitState(props.current.abc);
    this.init = this.getInit(props.current.abc);
    this.state = { changed: false };
  }

  componentWillReceiveProps({ current, form }) {
    const { abc, path } = current;
    if (path !== this.props.current.path) {
      this.init = this.getInit(abc);
      const { localeList, ...others } = this.init;
      this.setState({ changed: true }, () => {
        form.setFieldsValue({ ...others });
      });
    }
  }

  getInit (abc) {
    const state = {
      entry: typeof abc.entry === 'undefined' ? 'app/app.js' : abc.entry,
      port: typeof abc.port === 'undefined' ? '3000' : abc.port,
      // proxy: typeof abc.proxy === 'undefined' ? '' : abc.proxy,
      lazyload: typeof abc.lazyload === 'undefined' ? true : abc.lazyload,
      https: typeof abc.https === 'undefined' ? false : abc.https,
      open: typeof abc.open === 'undefined' ? false : abc.open,
      src: typeof abc.src === 'undefined' ? 'src' : abc.src,
    };

    if (abc.buildvars && abc.buildvars.locale) {
      state.localeList = abc.buildvars.locale;
      state.defaultLocale = abc.vars.locale;
    }
    return state;
  }

  handleSubmit = () => {
    const { form, dispatch, current } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        console.log(values);
        // const { localeList, defaultLocale, proxy, ...others } = values;
        const { localeList, defaultLocale, ...others } = values;
        const abc = { ...current.abc, ...others };
        if (defaultLocale) {
          abc.vars.locale = defaultLocale;
        }

        // if (proxy) {
        //   abc.proxy = proxy;
        // }
        
        dispatch({
          type: 'project/updateABCJson',
          payload: { project: current, abc }
        });
      }
    });
  }

  render () {
    const { getFieldDecorator } = this.props.form;
    const { entry, port, lazyload, https, open, localeList = [], defaultLocale, src } = this.init;
    let localeDiv;

    if (defaultLocale) {
      localeDiv = (
        <FormItem
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 8 }}
          label="Locale"
        >{getFieldDecorator('defaultLocale', {
          initialValue: defaultLocale,
        })(
          <Select>
            { localeList.map(item =>
              <Select.Option key={item} value={item}>{ item }</Select.Option>)
            }
          </Select>
        )}
        </FormItem>
        );
    }

    return (
      <Form className="setting-form">
        
        <Row className="setting-form-inline">
          <Col span="12" offset="0">
            <FormItem
              {...inlineFormItemLayout}
              label="Src"
            >{getFieldDecorator('src', {
              initialValue: src,
            })(<Input />)}
            </FormItem>
            <FormItem
              {...inlineFormItemLayout}
              label="Port"
            >{getFieldDecorator('port', {
              initialValue: port,
            })(<Input />)}
            </FormItem>
            <FormItem
              {...inlineFormItemLayout}
              label="Entry"
            >{getFieldDecorator('entry', {
              initialValue: entry,
            })(<Input />)}
            </FormItem>
          </Col>
          <Col span="12" offset="0">
            <FormItem
              {...inlineFormItemLayout}
              label="Lazyload"
            >{getFieldDecorator('lazyload', {
              initialValue: lazyload,
              valuePropName: 'checked'
            })(<Switch size="default" />)}
            </FormItem>
            <FormItem
              {...inlineFormItemLayout}
              label="Open"
            >{getFieldDecorator('open', {
              initialValue: open,
              valuePropName: 'checked',
            })(<Switch size="default" />)}
            </FormItem>
            <FormItem
              {...inlineFormItemLayout}
              label="Https"
            >{getFieldDecorator('https', {
              initialValue: https,
              valuePropName: 'checked',
            })(<Switch size="default" />)}
            </FormItem>
          </Col>
        </Row>
        { localeDiv }
       
        <Tooltip placement="top" title={i18n('foot.help')} >
          <Button type="primary" icon="question" shape="circle" size="small" ghost
            className="project-setting-help"
            onClick={() => openUrl('http://groups.alidemo.cn/alinw-tools/nowa/ben_di_kai_fa.html')}
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

// <FormItem
//   label="Proxy"
//   {...formItemLayout}
// >
//   {getFieldDecorator('proxy', {
//     initialValue: proxy,
//     rules: [{ type: 'url' }],
//   })(<Input />)}
// </FormItem>


ServerForm.propTypes = {
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
}))(ServerForm));
