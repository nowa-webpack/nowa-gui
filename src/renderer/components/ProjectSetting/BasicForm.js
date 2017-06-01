import React, { PropTypes } from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import Select from 'antd/lib/select';
import Col from 'antd/lib/col';
import Row from 'antd/lib/row';
import Form from 'antd/lib/form';

import i18n from 'i18n-renderer-nowa';
import { request } from 'shared-nowa';
import { VERSION_MATCH, NAME_MATCH } from 'const-renderer-nowa';
import { getLocalProjects } from 'store-renderer-nowa';


const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
};

const longFormLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

const BasicForm = ({
  current,
  form: {
    getFieldDecorator,
    validateFields,
  },
  registryList,
  dispatch,
}) => {
  const { pkg, registry, path } = current;
  const handleSubmit = () => {
    validateFields((err, data) => {
      if (!err) {
        console.log(data);
        dispatch({
          type: 'project/updatePackageJson',
          payload: { project: current, data }
        });
      }
    });
  };

  const nameValid = (rule, value, callback) => {
    const storeProjects = getLocalProjects();
    if (storeProjects.filter(item => item.name === value && item.path !== path).length) {
      callback('Name is already existed!');
    } else {
      callback();
      return;
    }
  };

  // const registryValid = (rule, value, callback) => {
  //   console.log(value);
  //   if (!registryList.includes(value)) {
  //     request(registry)
  //       .then(({ err }) => {
  //         if (err) callback(i18n('msg.invalidRegistry'));
  //         callback();
  //       });
  //   }
  //   callback();
  // };
 
  const initRepo = pkg.repository ? (pkg.repository.url || '') : '';

  return (
    <Form className="setting-form">
      <Row className="setting-form-inline" gutter={2}>
        <Col span="12" offset="0">
          <FormItem
            {...formItemLayout}
            label="Name"
            required
          >{getFieldDecorator('name', {
            initialValue: pkg.name || '',
            rules: [{ message: i18n('msg.invalidName'), pattern: NAME_MATCH },
              { validator: nameValid }]
          })(<Input />)}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="Version"
          >{getFieldDecorator('version', {
            initialValue: pkg.version || '1.0.0',
            rules: [{ message: i18n('msg.invalidVersion'), pattern: VERSION_MATCH }]
          })(<Input />)}
          </FormItem>
        </Col>
        <Col span="12" offset="0">
          <FormItem
            {...formItemLayout}
            label="Author"
          >{getFieldDecorator('author', {
            initialValue: pkg.author || '',
          })(<Input />)}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="License"
          >{getFieldDecorator('license', {
            initialValue: pkg.license || 'MIT',
          })(<Input />)}
          </FormItem>
        </Col>
      </Row>

      <FormItem
        label="Registry"
        {...longFormLayout}
        required
      >
        {getFieldDecorator('registry', {
          initialValue: registry,
          rules: [{ type: 'url' }]
        })(
          <Select
            mode="combobox"
            filterOption={false}
          >
            {registryList.map(item =>
              <Select.Option value={item} key={item}>{item}</Select.Option>)}
          </Select>
        )}
      </FormItem>

      <FormItem
        label="Description"
        {...longFormLayout}
      >
        {getFieldDecorator('description', {
          initialValue: pkg.description || '',
        })(<Input />)}
      </FormItem>

      <FormItem
        label="Repository"
        {...longFormLayout}
      >
        {getFieldDecorator('repo', {
          initialValue: initRepo,
        })(<Input />)}
      </FormItem>

      <FormItem
        label="Homepage"
        {...longFormLayout}
      >
        {getFieldDecorator('homepage', {
          initialValue: pkg.homepage,
          rules: [{ type: 'url' }]
        })(<Input />)}
      </FormItem>
      <FormItem wrapperCol={{ offset: 4 }} className="setting-form-btns">
        <Button type="primary" size="default" onClick={handleSubmit}>{i18n('form.submit')}</Button>
      </FormItem>
    </Form>
  );
};


BasicForm.propTypes = {
  current: PropTypes.shape({
    pkg: PropTypes.object,
    path: PropTypes.string,
    registry: PropTypes.string,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
  form: PropTypes.shape({
    getFieldDecorator: PropTypes.func,
    setFieldsValue: PropTypes.func,
    validateFields: PropTypes.func,
  }).isRequired,
  registryList: PropTypes.array.isRequired,
};

export default Form.create()(connect(({ project, setting }) => ({
  current: project.current,
  registryList: setting.registryList,
}))(BasicForm));
