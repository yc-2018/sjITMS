import {
  saveOrUpdate,
  getByCompanyUuidAndDcUuid,
} from '@/services/facility/BookConfig';

export default {
  namespace: 'bookConfig',

  state: {
    data: {},
  },

  effects: {
    *saveOrUpdate({ payload, callback }, { call, put }) {
      const response = yield call(saveOrUpdate, payload);
      if (callback) callback(response);
    },

    *getByCompanyUuidAndDcUuid({ payload, callback }, { call, put }) {
      const response = yield call(getByCompanyUuidAndDcUuid, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
          payload: response.data
        });
      }
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
  }
}