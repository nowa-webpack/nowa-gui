import React, { Component, PropTypes } from 'react';
import { remote } from 'electron';
import Button from 'antd/lib/button';
import Message from 'antd/lib/message';
import Table from 'antd/lib/table';
// import Tabs from 'antd/lib/tabs';
// import Input from 'antd/lib/input';
import semver from 'semver';
import vcompare from 'version-comparison';
import ncu from 'npm-check-updates';

import i18n from 'i18n';
import request from 'gui-request';
// const { command } = remote.getGlobal('services');

const columns = [{
  title: 'Name',
  dataIndex: 'name',
  key: 'name',
}, {
  title: 'Current Version',
  dataIndex: 'version',
  key: 'version',
}, {
  title: 'Newest Version',
  dataIndex: 'newVersion',
  key: 'newVersion',
}, {
  title: 'Action',
  key: 'action',
  render: (text, record) => (
    <Icon type="download" />
  ),
}];


class DependenceTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      selectedRowKeys: []
    };
  }

  componentWillReceiveProps({ project, path }) {
    // if (path !== this.props.project.path) {
    //   this.setState({ ...this.getInitDependencies(project.pkg) });
    // }
  }

  componentDidMount() {
    // this.fetch();
    // let d = await fetch();
    ncu.run({
        // Always specify the path to the package file 
        packageFile: 'package.json',
        // Any command-line option can be specified here. 
        // These are set by default: 
        silent: true,
        jsonUpgraded: true
    }).then((upgraded) => {
    console.log('dependencies to upgrade:', upgraded);
})
  }

  

  /** fetch() {
    const { source, registry } = this.props;

    const data = yield source.map(function *({ name, version }) {
      const url = `${registry}/${name}/latest`;
      const { data: repo, err } = yield request(url);

      if (err) {
        return {
          name,
          version,
          newVersion: version,
          update: false
        };
      }
      const newVersion = repo.version;
      console.log(version);
      const update = semver.lt(version, newVersion);

      return {
        name,
        version,
        newVersion,
        update
      };
    });

    console.log(data);
    
  }*/

  onSelectChange = (selectedRowKeys) => {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    this.setState({ selectedRowKeys });
  }

  async fetch() {
    const { source, registry } = this.props;
    console.log(source)
    const repos = await Promise.all(
        source.map(({ name }) => request(`${registry}/${name}/latest`))
      );

    const pkgs = source.forEach(({ name, version }, i) => {
      const { data, err } = repos[i];
      if (err) {
        return {
          name,
          version,
          newVersion: version,
          update: false
        };
      }
      // console.log(version)
      return {
        name,
        version,
        newVersion: data.version,
        update: vcompare(version, data.version)
      };

    });
    
    console.log(pkgs);
  }



  render() {
    const { loading, selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      selections: false,
    };
    const hasSelected = selectedRowKeys.length > 0;

    return (
       <div>
        <div style={{ marginBottom: 8 }}>
          <Button type="primary" onClick={this.start} size="small"
            disabled={!hasSelected}
          >Reload</Button>
        </div>
        <Table rowSelection={rowSelection} columns={columns} dataSource={[]} loading={loading} />
      </div>
    );
  }

}

DependenceTable.propTypes = {
  source: PropTypes.array.isRequired,
  registry: PropTypes.string.isRequired,
  // dispatch: PropTypes.func.isRequired,
};


export default DependenceTable;
