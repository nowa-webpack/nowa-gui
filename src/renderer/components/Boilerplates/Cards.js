import React, { Component, PropTypes } from 'react';
import Icon from 'antd/lib/icon';
import Tooltip from 'antd/lib/tooltip';
import { Search } from 'antd/lib/input';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';

import i18n from 'i18n-renderer-nowa';
import OfficialCard from './OfficialCard';
import LocalCard from './LocalCard';
import RemoteCard from './RemoteCard';
import AntCard from './AntCard';

class Cards extends Component {
  constructor(props) {
    super(props);
    this.state = {
      officialBoilerplates: props.officialBoilerplates || [],
      localBoilerplates: props.localBoilerplates || [],
      remoteBoilerplates: props.remoteBoilerplates || [],
      aliBoilerplates: props.aliBoilerplates || [],
      antBoilerplates: props.antBoilerplates || [],
    }
  }
  componentWillReceiveProps(next) {
    if (next.aliBoilerplates.length !== this.props.aliBoilerplates.length) {
      this.setState({ aliBoilerplates: next.aliBoilerplates})
    }
    if (next.antBoilerplates.length !== this.props.antBoilerplates.length) {
      this.setState({ antBoilerplates: next.antBoilerplates})
    }
  }
  onSearch = value => {
    const {
      officialBoilerplates,
      localBoilerplates,
      remoteBoilerplates,
      aliBoilerplates,
      antBoilerplates
    } = this.props;
    if (value) {
      const newOfficial = officialBoilerplates.filter(item => item.name.indexOf(value) > -1);
      const newAli = aliBoilerplates.filter(item => item.name.indexOf(value) > -1);
      const newLocal = localBoilerplates.filter(item => item.name.indexOf(value) > -1);
      const newRemote = remoteBoilerplates.filter(item => item.name.indexOf(value) > -1);
      const newAnt = antBoilerplates.filter(item => item.name.indexOf(value) > -1);

      this.setState({
        officialBoilerplates: newOfficial,
        aliBoilerplates: newAli,
        localBoilerplates: newLocal,
        remoteBoilerplates: newRemote,
        antBoilerplates: newAnt,
      });
    } else {
      this.setState({
        officialBoilerplates,
        aliBoilerplates,
        localBoilerplates,
        remoteBoilerplates,
        antBoilerplates,
      });
    }
  }
  render() {
    const { dispatch } = this.props;
    const {
      officialBoilerplates,
      localBoilerplates,
      remoteBoilerplates,
      aliBoilerplates,
      antBoilerplates
    } = this.state;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Row className="boilerplate-search"><Col span="10" offset="7">
          <Search
            placeholder="Search boilerplates"
            onSearch={this.onSearch}
            size="large"
            suffix={<Icon type="search" />}
          />
          </Col></Row><br />
        <div className="boilerplate-cards">
          
          { remoteBoilerplates.length > 0
            && remoteBoilerplates.map(item =>
              <RemoteCard
                key={item.id}
                data={item}
                dispatch={dispatch}
              />)
          }
          { localBoilerplates.length > 0
            && localBoilerplates.map(item =>
              <LocalCard
                key={item.id}
                data={item}
                dispatch={dispatch}
              />)
          }
          { officialBoilerplates.length > 0
            && officialBoilerplates.map(item =>
              <OfficialCard
                key={`officical-${item.name}`}
                data={item}
                dispatch={dispatch}
                type="official"
              />)
          }
          { aliBoilerplates.length > 0
            && aliBoilerplates.map(item =>
              <OfficialCard
                key={`ali-${item.name}`}
                data={item}
                dispatch={dispatch}
                type="ali"
              />)
          }
          { antBoilerplates.length > 0
            && antBoilerplates.map(item =>
              <AntCard
                key={`ant-${item.name}`}
                data={item}
                dispatch={dispatch}
              />)
          }
          <Tooltip placement="left" title={i18n('project.new.addTempldate')} >
            <div
              className="boilerplate-card-add"
              onClick={() => dispatch({
                type: 'boilerplate/changeStatus',
                payload: { showAddBoilerplateModal: true, addOrEditBoilerplateType: 'new' }
              })}
            ><Icon type="plus" />
            </div>
          </Tooltip>
        </div>
      </div>
    );
  }
}

/*const Cards = ({
  officialBoilerplates = [],
  localBoilerplates = [],
  remoteBoilerplates = [],
  aliBoilerplates = [],
  antBoilerplates = [],
  dispatch
}) => (
  <div style={{ display: 'flex', flexDirection: 'column'}}>
    <Row className="boilerplate-search"><Col span="10" offset="7">
      <Search
        placeholder="Search boilerplates"
        onSearch={value => dispatch({ type: 'boilerplate/search', payload: value })}
        size="large"
        suffix={<Icon type="search" />}
      />
      </Col></Row><br />
    <div className="boilerplate-cards">
      
      { remoteBoilerplates.length > 0
        && remoteBoilerplates.map(item =>
          <RemoteCard
            key={item.id}
            data={item}
            dispatch={dispatch}
          />)
      }
      { localBoilerplates.length > 0
        && localBoilerplates.map(item =>
          <LocalCard
            key={item.id}
            data={item}
            dispatch={dispatch}
          />)
      }
      { officialBoilerplates.length > 0
        && officialBoilerplates.map(item =>
          <OfficialCard
            key={`officical-${item.name}`}
            data={item}
            dispatch={dispatch}
            type="official"
          />)
      }
      { aliBoilerplates.length > 0
        && aliBoilerplates.map(item =>
          <OfficialCard
            key={`ali-${item.name}`}
            data={item}
            dispatch={dispatch}
            type="ali"
          />)
      }
      { antBoilerplates.length > 0
        && antBoilerplates.map(item =>
          <AntCard
            key={`ant-${item.name}`}
            data={item}
            dispatch={dispatch}
          />)
      }
      <Tooltip placement="left" title={i18n('project.new.addTempldate')} >
        <div
          className="boilerplate-card-add"
          onClick={() => dispatch({
            type: 'boilerplate/changeStatus',
            payload: { showAddBoilerplateModal: true, addOrEditBoilerplateType: 'new' }
          })}
        ><Icon type="plus" />
        </div>
      </Tooltip>
    </div>
  </div>
);*/


Cards.propTypes = {
  officialBoilerplates: PropTypes.array.isRequired,
  aliBoilerplates: PropTypes.array.isRequired,
  localBoilerplates: PropTypes.array.isRequired,
  remoteBoilerplates: PropTypes.array.isRequired,
  antBoilerplates: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default Cards;
