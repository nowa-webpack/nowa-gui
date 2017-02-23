import React, {Component} from 'react';
import { connect } from 'dva';
import { remote } from 'electron';
import i18n from 'i18n';
import Steps from 'antd/lib/steps';
import Button from 'antd/lib/button';


import TemplateCards from '../components/NewProject/TemplateCards';
import TemplateForm from '../components/NewProject/TemplateForm';
import InstallLog from '../components/NewProject/InstallLog';

const Step = Steps.Step;

const steps = [{
  title: 'Select Template',
}, {
  title: 'Template Form',
}, {
  title: 'Installing',
}];

class NewProject extends React.Component {
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
    const { templates, loading, term, dispatch } = this.props;
    const { current } = this.state;
    let component;

    if (current === 0) {
      const compProps = {
        templates,
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
        term
      };
      component = <InstallLog {...compProps} />;
    }

    return (
      <div className="new-project">
        <Steps current={current} size="small">
          {steps.map(item => <Step key={item.title} title={item.title} />)}
        </Steps>
        <div className="steps-content">{component}</div>
      </div>
    );
  }
}

export default connect(({ init }) => ({
  templates: init.templates,
  loading: init.loading,
  term: init.term,
}))(NewProject);


// <div className="steps-action">
//           {
//             this.state.current < steps.length - 1
//             &&
//             <Button type="primary" onClick={() => this.next()}>Next</Button>
//           }
//           {
//             this.state.current === steps.length - 1
//             &&
//             <Button type="primary" onClick={() => message.success('Processing complete!')}>Done</Button>
//           }
//           {
//             this.state.current > 0
//             &&
//             <Button style={{ marginLeft: 8 }} onClick={() => this.prev()}>
//               Previous
//             </Button>
//           }
//         </div>

/*const Welcome = ({ init: { templates, loading, term }, showForm, showLog, dispatch }) => {
  const listProps = {
    templates,
    loading,
    dispatch
  };

  const logProps = {
    dispatch,
    term
  };

  let html;
  if (showForm) {
    html = <TemplateForm />;
  } else if (showLog) {
    html = <InstallLog {...logProps} />;
  } else {
    html = <TemplateList {...listProps} />;
  }

  return html;
};

export default connect(({ init, layout }) => ({
  init,
  showForm: layout.showCreateForm,
  showLog: layout.showInstallLog
}))(Welcome);*/
