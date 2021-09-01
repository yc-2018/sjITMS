import {
  get,
  save
} from '@/services/account/Erp';

export default {
  namespace: 'erp',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },
  effects: {
    *add({ payload, callback }, { call, put }) {
      const response = yield call(save, payload);
      if (callback) callback(response);
    },
    *get({ payload, callback }, { call, put }) {
      const response = yield call(get, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
          payload: {
            erp: response.data,
          }
        });
      }
      if (callback) callback(response);
    }
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
};
