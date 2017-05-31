import React from 'react';
import { Router } from 'dva/router';

<<<<<<< HEAD

export default function({ history }) {
=======
export default function({ history, app }) {
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9

  const routes = [
    {
      path: '/',
<<<<<<< HEAD
=======
      name: 'app',
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
      getComponent(nextState, cb) {
        import('./routes/IndexPage').then((module) => {
          cb(null, module.default);
        });
      },
    },
  ];

  return <Router history={history} routes={routes} />;
}
<<<<<<< HEAD

=======
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
