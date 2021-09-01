import {
  get,
  fetch
} from '@/services/account/Resource';

export default {
  namespace: 'resource',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },
  effects: {
    *get({ payload, callback }, { call, put }) {
      const response = yield call(get, payload);
      if (callback) callback(response);
    },
    *fetch({ payload, callback }, { call, put }) {
      const response = yield call(fetch);
      if (callback) callback(response);
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
}