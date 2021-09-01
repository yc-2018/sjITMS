import {
  upload,
  get
} from '@/services/common/Oss';

export default {
  namespace: 'oss',

  state: {
  },

  effects: {
    *upload({ payload, callback }, { call, put }) {
      const response = yield call(upload, payload);
      if (callback) callback(response);
    },
    *get({ payload, callback }, { call, put }) {
      const response = yield call(get, payload);
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