import React, { Component, PropTypes } from 'react';

const CommandTermList = ({ commands, dispatch }) => {
  return (
    <div className="cmd-sider">
      <h3>Command List</h3>
      { commands.map(cmd =>
        <div className="cmd-item" key={cmd}>
          {cmd}
          <i className="iconfont icon-stop" />
          <i className="iconfont icon-play" />
        </div>)}
    </div>
  );
};

export default CommandTermList;