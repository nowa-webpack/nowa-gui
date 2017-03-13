import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import Layout from 'antd/lib/layout';
import Steps from 'antd/lib/steps';
import i18n from 'i18n';

import TemplateCards from '../components/NewProject/TemplateCards';
import TemplateForm from '../components/NewProject/TemplateForm';
import InstallLog from '../components/NewProject/InstallLog';

const { Content } = Layout;
const Step = Steps.Step;

const steps = [{
  title: i18n('project.new.step1'),
}, {
  title: i18n('project.new.step2'),
}, {
  title: i18n('project.new.step3'),
}];

class NewProjectPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current: 0,
    };
  }
  next() {
    const current = this.state.current + 1;
    this.setState({ current });
  }
  prev() {
    const current = this.state.current - 1;
    this.setState({ current });
  }
  render() {
    const {
      officalTemplates, localTemplates, remoteTemplates, loading, term, dispatch
    } = this.props;
    const { current } = this.state;
    let component;

    if (current === 0) {
      const compProps = {
        officalTemplates,
        localTemplates,
        remoteTemplates,
        loading,
        dispatch,
        next: this.next.bind(this),
      };
      component = <TemplateCards {...compProps} />;
    }

    if (current === 1) {
      const compProps = {
        next: this.next.bind(this),
        prev: this.prev.bind(this),
      };
      component = <TemplateForm {...compProps} />;
    }

    if (current === 2) {
      const compProps = {
        dispatch,
        term,
        prev: this.prev.bind(this),
      };
      component = <InstallLog {...compProps} />;
    }

    return (
      <Content className="ui-content new-proj">
        <h2 className="title">{i18n('project.new.title')}</h2>
        <Steps current={current} >
          {steps.map(item => <Step key={item.title} title={item.title} />)}
        </Steps>
        <div className="steps-content">{component}</div>
      </Content>
    );
  }
}

NewProjectPage.propTypes = {
  officalTemplates: PropTypes.array.isRequired,
  localTemplates: PropTypes.array.isRequired,
  remoteTemplates: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  term: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
};

export default connect(({ init }) => ({
  officalTemplates: init.officalTemplates,
  localTemplates: init.localTemplates,
  remoteTemplates: init.remoteTemplates,
  loading: init.loading,
  term: init.term,
}))(NewProjectPage);

