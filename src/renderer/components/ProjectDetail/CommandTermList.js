import React, { Component, PropTypes } from 'react';

const CommandTermList = ({ commands, name, dispatch }) => {
  const startCmd = (type) => dispatch({
    type: 'task/execCustomCmd',
    payload: { type, name }
  });
  const stopCmd = (type) => dispatch({
    type: 'task/stopCustomCmd',
    payload: { type, name }
  });
  return (
    <div className="cmd-sider">
      <h3>Command List</h3>
      { commands.map(cmd =>
        <div className="cmd-item" key={cmd}>
          {cmd}
          <i className="iconfont icon-stop" onClick={() => stopCmd(cmd)} />
          <i className="iconfont icon-play" onClick={() => startCmd(cmd)} />
        </div>)}
    </div>
  );
};

export default CommandTermList;