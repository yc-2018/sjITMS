import {
  modify, get
} from '@/services/account/dailyKnotsConfig';

export default {
  namespace: 'dailyKnotConfig',

  state: {
    entity: {}
  },

  effects: {
    *modify({ payload, callback }, { call, put }) {
      const response = yield call(modify, payload);
      if (callback) callback(response);
    },
    *get({ payload, callback }, { call, put }) {
      const response = yield call(get, payload);
      if (callback) callback(response);
    },
  },

  reducers: {
    modify(state, action) {
      return {
        ...state,
        reportUrl: action.payload,
      };
    }
  },
}
