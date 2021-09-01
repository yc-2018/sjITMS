import {
  saveOrUpdate,
  getByDcUuid,
} from '@/services/facility/StockOutConfig';

export default {
  namespace: 'stockOutConfig',

  state: {
    data: {},
  },

  effects: {
    *saveOrUpdate({ payload, callback }, { call, put }) {
      const response = yield call(saveOrUpdate, payload);
      if (callback) callback(response);
    },

    *getByDcUuid({ payload, callback }, { call, put }) {
      const response = yield call(getByDcUuid, payload);
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