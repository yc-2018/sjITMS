import {
  execute,
  getSchedule,
} from '@/services/inner/PreRpl';

export default {
  namespace: 'preRpl',
  state: {
  },
  effects: {
    *onExecute({ payload, callback }, { call, put }) {
      const response = yield call(execute, payload);
      if (callback) callback(response);
    },
    *getSchedule({ payload, callback }, { call, put }) {
      const response = yield call(getSchedule, payload);
      if (response && response.success) {
        yield put({
          type: 'onSchedule',
          payload: response.data ? response.data : {}
        });
      }
    },
  },

  reducers: {
    onSchedule(state, action) {
      return {
        ...state,
        schedule: action.payload
      }
    },
  },

};
