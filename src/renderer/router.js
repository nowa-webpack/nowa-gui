import React from 'react';
import { Router } from 'dva/router';


export default function({ history }) {

  const routes = [
    {
      path: '/',
      getComponent(nextState, cb) {
        import('./routes/IndexPage').then((module) => {
          cb(null, module.default);
        });
      },
    },
  ];

  return <Router history={history} routes={routes} />;
}

