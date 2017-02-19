import React, {Component} from 'react';
// import Xterm from 'xterm';
import Layout from 'antd/lib/layout';
import Button from 'antd/lib/button';
import Message from 'antd/lib/message';
import i18n from 'i18n';
import ansiHTML from 'ansi-html';

const { Header, Content } = Layout;

// ansiHTML.setColors({
//   // reset: ['555', '666'], // FOREGROUND-COLOR or [FOREGROUND-COLOR] or [, BACKGROUND-COLOR] or [FOREGROUND-COLOR, BACKGROUND-COLOR]
//   black: '000', // String
//   red: 'f98677',
//   green: '79cc66',
//   yellow: 'efe594',
//   blue: '8ec4ec',
//   magenta: 'ff96fa',
//   cyan: '969cff',
//   lightgrey: 'f98677',
//   darkgrey: '444'
// });


class Log extends Component {

  constructor(props) {
    super(props);
    this.state = {
      logs: ''
    }
  }

  componentDidMount() {

    const { term, dispatch } = this.props;

    term.stdout.on('data', (data) => {
      const { logs } = this.state;
      
      this.setState({
        logs: logs + (ansiHTML(data.toString()) + '<br>'),
      });

    });
    
    term.on('exit', (code) => {
      Message.success('Installed Success!');
      console.log('exit install')
      dispatch({
        type: 'init/finishedInstall',
      });
      
    });
  }

  clearTerm(){
    this.setState({
      logs: ''
    });
  }

  render(){
    return (
      <Layout className="welcome" style={{ background: '#fff'}}>
        <Header className="welcome-header">
          <h2 className="welcome-title">Install Log</h2>
        </Header>
        <Content>
          <div className="terminal-wrap">
            <div className="term-container" dangerouslySetInnerHTML={{ __html: this.state.logs}} />
          </div>
        </Content>
      </Layout>
    );
  }

}


export default Log;


// this.term = new Xterm({
    //   rows: 20,
    //   cols: 61
    // });
    // this.term.open(this.container);
    // term.on('data', (data) => {
          
    //   this.term.write(data);
    //   this.logs += data;
    // });

    // term.on('exit', (code) => {
    //   // console.log('exit', name)
    //   Message.success('Installed Success!');
    //   dispatch({
    //     type: 'init/finishedInstall',
    //   });
    //   dispatch({
    //     type: 'layout/changeStatus',
    //     payload:{
    //       showInstallLog: false
    //     }
    //   });
    // });