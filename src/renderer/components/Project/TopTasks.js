import React, { PropTypes } from 'react';
import { connect } from 'dva';
import i18n from 'i18n-renderer-nowa';

import Opt from './TopTaskOpt';
import PluginOpt from './PluginOpt';


const TopTasks = ({
  current,
  plugins,
  dispatch,
}) => {
  const { start, path, pkg, isNowa } = current;
  const hasBuildFunc = pkg.scripts && pkg.scripts.build;
  const hasStartFunc = pkg.scripts && pkg.scripts.start;

  const startProj = () => dispatch({ type: 'task/start', payload: { project: current } });
  const buildProj = () => dispatch({ type: 'task/execCommand', payload: { command: 'build', projPath: path } });
  const stopProj = () => dispatch({ type: 'task/stop', payload: { project: current } });
  const openEditor = () => dispatch({ type: 'task/editor', payload: { project: current } });
  const compassProj = () => {
    if (isNowa && start) {
      dispatch({ type: 'task/compass', payload: { projPath: path } });
    }
  };

  const openTerminal = () => dispatch({ type: 'task/terminal', payload: { project: current } });
  
  return (
    <div className="project-top">
      {
        start ?
        <Opt
          name={i18n('task.stop')}
          disable={false}
          action={stopProj}
          tip=""
          icon="stop"
        /> : <Opt
          name={i18n('task.start')}
          disable={!hasStartFunc}
          action={startProj}
          tip="Cannot find scripts.start in pacakge.json"
          icon="play"
        />
      }
      <Opt
        name={i18n('task.compass')}
        disable={!start || !isNowa}
        action={compassProj}
        tip=""
        icon="compass"
      />
      <Opt
        name={i18n('task.compile')}
        disable={!hasBuildFunc}
        action={buildProj}
        tip="Cannot find scripts.build in pacakge.json"
        icon="similarproduct"
      />
      <Opt
        name={i18n('task.editor')}
        disable={false}
        action={openEditor}
        tip=""
        icon="code"
      />
      <Opt
        name={i18n('task.terminal')}
        disable={false}
        action={openTerminal}
        tip=""
        icon="terminal"
      />
      {
        plugins.length > 0 && <PluginOpt />
      }
    </div>
  );
};

TopTasks.propTypes = {
  current: PropTypes.shape({
    name: PropTypes.string,
    path: PropTypes.string,
    isNowa: PropTypes.bool,
    pkg: PropTypes.object,
  }).isRequired,
  plugins: PropTypes.arrayOf(PropTypes.object).isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect(({ project, plugin }) => ({
  current: project.current,
  plugins: plugin.UIPluginList
}))(TopTasks);
