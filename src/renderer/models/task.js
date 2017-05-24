
export default {

  namespace: 'task',

  state: {

  },

  subscriptions: {
    setup({ dispatch }) {
    },
  },

  effects: {
    * execCommand({ payload: { project, command } }, { put, select }) {
      console.log('execCommand', command);
    },
    * stop({ payload: { project } }, { put, select }) {
      console.log('stop', project.path);
    },
    * start({ payload: { project } }, { put, select }) {
      console.log('start', project.path);
    },
    * editor({ payload: { project } }, { put, select }) {
      console.log('editor', project.path);
    },
    * compass({ payload: { project } }, { put, select }) {
      console.log('compass', project.path);
    },
    * terminal({ payload: { project } }, { put, select }) {
      console.log('terminal', project.path);
    },
  },

  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },
};