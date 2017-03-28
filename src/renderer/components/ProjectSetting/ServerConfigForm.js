import React, { Component, PropTypes } from 'react';
import { connect } from 'dva';
import Button from 'antd/lib/button';
import Message from 'antd/lib/message';
// import Popconfirm from 'antd/lib/popconfirm';
import Switch from 'antd/lib/switch';
import classNames from 'classnames';
import Select from 'antd/lib/select';

import i18n from 'i18n';
import { PORT_MATCH, URL_MATCH } from 'gui-const';

class ServerConfigForm extends Component {
  constructor(props) {
    super(props);
    this.state = this.getInitState(props.project.abc);
  }

  componentWillReceiveProps({ project, path }) {
    if (path !== this.props.project.path) {
      this.setState(this.getInitState(project.abc));
    }
  }

  getInitState(abc) {
    const state = {
      entry: typeof abc.entry === 'undefined' ? 'app/app.js' : abc.entry,
      port: typeof abc.port === 'undefined' ? '3000' : abc.port,
      proxy: typeof abc.proxy === 'undefined' ? '' : abc.proxy,
      lazyload: typeof abc.lazyload === 'undefined' ? true : abc.lazyload,
      https: typeof abc.https === 'undefined' ? false : abc.https,
      open: typeof abc.open === 'undefined' ? false : abc.open,
    };

    if (abc.buildvars.locale) {
      state.localeList = abc.buildvars.locale;
      state.defaultLocale = abc.vars.locale;
    } else {
      state.localeList = null;
      state.defaultLocale = null;
    }
    return state;
  }

  handleSubmit() {
    const { dispatch, project } = this.props;
    const { localeList, defaultLocale, proxy, ...others } = this.state;
    if (!PORT_MATCH.test(+this.state.port)) {
      Message.error(i18n('msg.invalidPort'));
      return false;
    }

    const newABC = { ...project.abc, ...others };

    if (defaultLocale) {
      newABC.vars.locale = defaultLocale;
    }

    if (proxy) {
      newABC.proxy = proxy;
    }

    dispatch({
      type: 'project/updateServerConfig',
      payload: { project, abc: newABC }
    });



    // if (!URL_MATCH.test(+proxy)) {
    //   Message.error(i18n('msg.invalidUrl'));
    //   return false;
    // }
  }
  
 
  render() {
    const { entry, port, proxy, lazyload, https, open, localeList, defaultLocale } = this.state;
    let localeDiv;

    if (defaultLocale) {
      localeDiv = (
        <div className="form-item">
          <label className="form-label">Locale:</label>
          <Select
            style={{ width: 100 }}
            defaultValue={defaultLocale}
            onChange={value => this.setState({ defaultLocale: value })}
          >
            { localeList.map(item =>
              <Select.Option key={item} value={item}>{ item }</Select.Option>)
            }
          </Select>
        </div>
        );
    }

    return (
      <form className="ui-form" >
        <div className="form-item">
          <label className="form-label">Lazyload:</label>
          <Switch size="default" checked={lazyload}
            onChange={checked => this.setState({ lazyload: checked })}
          />
        </div>

        <div className="form-item">
          <label className="form-label">Https:</label>
          <Switch size="default" checked={https}
            onChange={checked => this.setState({ https: checked })}
          />
        </div>

        <div className="form-item">
          <label className="form-label">Open:</label>
          <Switch size="default" checked={open}
            onChange={checked => this.setState({ open: checked })}
          />
        </div>

        <div className="form-item">
          <label className="form-label">Entry:</label>
          <input type="text"
            className="sm"
            onChange={e => this.setState({ entry: e.target.value })}
            value={entry}
          />
        </div>
        <div className="form-item">
          <label className="form-label">Port:</label>
          <input type="text"
            className="sm"
            onChange={e => this.setState({ port: e.target.value })}
            value={port}
          />
        </div>
        <div className="form-item">
          <label className="form-label">Proxy:</label>
          <input type="text"
            className="lg"
            onChange={e => this.setState({ proxy: e.target.value })}
            value={proxy}
            placeholder="url"
          />
        </div>
        { localeDiv }
        <div className="form-btns">
          <Button type="primary" size="default" onClick={() => this.handleSubmit()}>{i18n('form.submit')}</Button>
        </div>
      </form>
    );
  }
}

ServerConfigForm.propTypes = {
  project: PropTypes.shape({
    abc: PropTypes.object,
    path: PropTypes.string,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect(({ project }) => ({ project: project.current }))(ServerConfigForm);
