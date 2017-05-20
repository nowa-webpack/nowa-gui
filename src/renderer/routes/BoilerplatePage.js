import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Content } from 'antd/lib/layout';
import Steps from 'antd/lib/steps';
import i18n from 'i18n-renderer-nowa';

import BoilerplateCards from '../components/Boilerplates/Cards';
import BoilerplateSetting from '../components/Boilerplates/Setting';
import NewBoilerplateModal from '../components/NewBoilerplate/Modal';

const Step = Steps.Step;

const steps = [{
  title: i18n('project.new.step1'),
}, {
  title: i18n('project.new.step2'),
}, {
  title: i18n('project.new.step3'),
}];

const BoilerplatePage = ({
  officialBoilerplates,
  localBoilerplates,
  remoteBoilerplates,
  dispatch,
  processStep,
}) => {

  let component;

  switch (processStep) {
    case 0: {
      const compProps = {
        officialBoilerplates,
        localBoilerplates,
        remoteBoilerplates,
        dispatch,
      };
      component = <BoilerplateCards {...compProps} />;
      break;
    }
    case 1: {
      component = <BoilerplateSetting />;
      break;
    }
    // case 2: {
    //   // const compProps = {
    //   //   dispatch,
    //   //   prev: this.prev,
    //   // };
    //   component = <div />;
    //   break;
    // }
    default:
      component = <div />;
      break;
  }

  return (
    <Content className="boilerplate">
      <h2 className="boilerplate-title">{i18n('project.new.title')}</h2>
      <Steps current={processStep} >
        {steps.map(item => <Step key={item.title} title={item.title} />)}
      </Steps>
      <div className="boilerplate-body">{component}</div>
      <NewBoilerplateModal />
    </Content>
  );
};


BoilerplatePage.propTypes = {
  officialBoilerplates: PropTypes.array.isRequired,
  localBoilerplates: PropTypes.array.isRequired,
  remoteBoilerplates: PropTypes.array.isRequired,
  processStep: PropTypes.number.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect(({ boilerplate, projectCreate }) => ({
  officialBoilerplates: boilerplate.officialBoilerplates,
  localBoilerplates: boilerplate.localBoilerplates,
  remoteBoilerplates: boilerplate.remoteBoilerplates,
  processStep: projectCreate.processStep,
}))(BoilerplatePage);