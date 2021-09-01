import {
  saveOrUpdate,
  get,
} from '@/services/facility/config/RefundReceiveConfig';

export default {
  namespace: 'refundReceiveConfig',

  state: {
    data: {},
  },

  effects: {
    *saveOrUpdate({ payload, callback }, { call, put }) {
      const response = yield call(saveOrUpdate, payload);
      if (callback) callback(response);
    },

    *get({ payload, callback }, { call, put }) {
      const response = yield call(get, payload);
      if (response && response.success && response.data) {
        yield put({
          type: 'save',
          payload: response.data,
        });
      }
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  }
}
