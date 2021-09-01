import {
  saveOrModify,
  getByDcUuid,
} from '@/services/facility/PrinterConfig';

export default {
  namespace: 'printerConfig',

  state: {
    data: {},
  },

  effects: {
    *saveOrModify({ payload, callback }, { call, put }) {
      const response = yield call(saveOrModify, payload);
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