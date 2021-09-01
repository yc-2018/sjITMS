import {
  modify, get1
} from '@/services/account/billConfig';

export default {
  namespace: 'billConfig',

  state: {
    entity: {}
  },

  effects: {
    *modify({ payload, callback }, { call, put }) {
      const response = yield call(modify, payload);
      if (callback) callback(response);
    },
    *get({ payload, callback }, { call, put }) {
      const response = yield call(get1, payload);
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
