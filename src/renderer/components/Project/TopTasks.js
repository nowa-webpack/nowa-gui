import React, { PropTypes } from 'react';
import { shell, remote } from 'electron';
import { connect } from 'dva';
import classNames from 'classnames';
import i18n from 'i18n-renderer-nowa';

import Opt from './TopTaskOpt';

const { command } = remote.getGlobal('services');


const TopTasks = ({
  current,
  dispatch,
}) => {
  const { start, path, pkg, isNowa } = current;
  const hasBuildFunc = pkg.scripts && pkg.scripts.build;
  const hasStartFunc = pkg.scripts && pkg.scripts.start;

  const startProj = () => dispatch({ type: 'task/start', payload: { project: current } });
  const buildProj = () => dispatch({ type: 'task/execCommand', payload: { command: 'build', project: current } });
  const stopProj = () => dispatch({ type: 'task/stop', payload: { project: current } });
  const openEditor = () => dispatch({ type: 'task/editor', payload: { project: current } });
  const compassProj = () => {
    if (isNowa && start) {
      dispatch({ type: 'task/compass', payload: { project: current } });
      // const task = remote.require('./services/task');
      // const { uid } = task.getTask('start', path);
      // delay(1000).then(shell.openExternal(getAddressByUID(uid)));
    }
  };

  const openTerminal = () => dispatch({ type: 'task/terminal', payload: { project: current } });
  // const hasBuildFunc = 'scripts' in pkg && 'build' in pkg.scripts;
  // const hasStartFunc = 'scripts' in pkg && 'start' in pkg.scripts;

  // const buildBtn = (<Opt />

  /*let buildBtn;
  let startBtn;

  if (hasStartFunc) {
    startBtn = !start
      ? (<div className="project-top-task start" onClick={startProj}>
          <i className="iconfont icon-play" /><br />{i18n('task.start')}
        </div>)
      : (<div className="project-top-task" onClick={stopProj}>
          <i className="iconfont icon-stop" /><br />{i18n('task.stop')}
        </div>);
  } else {
    startBtn = (
      <Tooltip placement="top" title="Cannot find scripts.start in pacakge.json" >
        <div className="project-top-task start disable">
          <i className="iconfont icon-play" /><br />{i18n('task.start')}
        </div>
      </Tooltip>
    );
  }
*/


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
        action={openEditor}
        tip=""
        icon="terminal"
      />
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
  dispatch: PropTypes.func.isRequired,
};

export default connect(({ project }) => ({
  current: project.current,
}))(TopTasks);
