import React, { PropTypes } from 'react';
import { connect } from 'dva';
import { shell } from 'electron';
import { join } from 'path';
import Layout from 'antd/lib/layout';
import i18n from 'i18n';

import Tab from '../components/ProjectDetail/Tab';

const { Content } = Layout;

const ProjectDetailPage = ({ current, termBuild, termStart, activeTab, dispatch }) => {
  const { start, port, path } = current;
  const tabProps = { current, termBuild, termStart, activeTab, dispatch };

  const startProj = () => dispatch({ type: 'task/start', payload: { project: current } });
  const buildProj = () => dispatch({ type: 'task/build', payload: { project: current } });
  const stopProj = () => dispatch({ type: 'task/stop', payload: { project: current } });

  return (
    <Content className="ui-content proj-detail">
      <Tab {...tabProps} />
      <div className="opt-grp">
        { !start
          ? <div className="opt start" onClick={startProj}>
              <i className="iconfont icon-play" /><br />{i18n('task.start')}
            </div>
          : <div className="opt" onClick={stopProj}>
              <i className="iconfont icon-stop" /><br />{i18n('task.stop')}
            </div>
        }
        { start && <div className="opt" onClick={() => shell.openExternal(`http://localhost:${port}`)} >
            <i className="iconfont icon-compass" /><br />{i18n('task.compass')}
          </div>
        }
        <div className="opt" onClick={buildProj}>
          <i className="iconfont icon-similarproduct" /><br />{i18n('task.compile')}
        </div>
        <div className="opt " onClick={() => {}}>
          <i className="iconfont icon-code" /><br />{i18n('task.editor')}
        </div>
        <div className="opt " onClick={() => shell.showItemInFolder(join(path, 'abc.json'))}>
          <i className="iconfont icon-folder" /><br />{i18n('task.folder')}
        </div>
      </div>
    </Content>
  );
};

ProjectDetailPage.propTypes = {
  activeTab: PropTypes.string.isRequired,
  termStart: PropTypes.object,
  termBuild: PropTypes.object,
  current: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect(({ project, task, layout }) => ({
  current: project.current,
  termBuild: task.build[project.current.path],
  termStart: task.start[project.current.path],
  activeTab: layout.activeTab
}))(ProjectDetailPage);
