import { save, modify, get } from '@/services/facility/PackageConfig';

export default {
  namespace: 'packageConfig',

  state: {
    data: {},
  },

  effects: {
    *save({ payload, callback }, { call, put }) {
      const response = yield call(save, payload);
      if (callback) callback(response);
    },
    *modify({ payload, callback }, { call, put }) {
      const response = yield call(modify, payload);
      if (callback) callback(response);
    },
    *get({ payload, callback }, { call, put }) {
      const response = yield call(get, payload);
      if (callback) callback(response);
    }
  },

  reducers: {
    success(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  }
};
