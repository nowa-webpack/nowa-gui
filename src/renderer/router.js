import React from 'react';
import { Router, Route } from 'dva/router';
// import IndexPage from './routes/IndexPage';

export default function({ history, app }) {

  const routes = [
    {
      path: '/',
      name: 'app',
      getComponent(nextState, cb) {
        import('./routes/IndexPage').then((module) => {
          cb(null, module.default);
        });
      },
    }
  ];

  return <Router history={history} routes={routes} />;
}
