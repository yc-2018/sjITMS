import {
  saveOrUpdate,
  getByCompamyUuidAndDcUuid,
} from '@/services/facility/CountingBinConfig';

export default {
  namespace: 'countingBinConfig',

  state: {
    data: {},
  },

  effects: {
    *saveOrUpdate({ payload, callback }, { call, put }) {
      const response = yield call(saveOrUpdate, payload);
      if (callback) callback(response);
    },

    *getByCompamyUuidAndDcUuid({ payload, callback }, { call, put }) {
      const response = yield call(getByCompamyUuidAndDcUuid, payload);
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
