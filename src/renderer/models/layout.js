
import { getLocalProjects } from '../services/localStorage';

export default {

  namespace: 'layout',

  state: {
    showConfig: false,  // show project detail page
    showCreateForm: false,  // show init form
    showInstallLog: false,  // show InstallLog
    activeTab: '1'
  },

  subscriptions: {
    setup({ history, dispatch }) {

      const projects = getLocalProjects();

      if (projects.length) {
        dispatch({
          type: 'changeStatus',
          payload: {
            showConfig: true
          }
        });
      } else {
        dispatch({
          type: 'changeStatus',
          payload: {
            showConfig: false
          }
        });
      }
    },
  },

  effects: {
  },

  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },

};

