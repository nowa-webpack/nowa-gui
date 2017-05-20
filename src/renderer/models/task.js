
export default {

  namespace: 'task',

  state: {
  },

  subscriptions: {
    setup({ dispatch }) {
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