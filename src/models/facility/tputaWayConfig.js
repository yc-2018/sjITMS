import {
  getByCompanyUuidAndDcUuid,
  insert,
  modify
} from '@/services/facility/TPutAwayConfig';

export default {
  namespace: 'tPutAwayConfig',

  state: {
    data: {},
  },
  effects: {
    *getByCompanyUuidAndDcUuid({ payload }, { call, put }) {
      const response = yield call(getByCompanyUuidAndDcUuid, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
          payload: response.data,
        });
      }
    },
    *insert({ payload, callback }, { call, put }) {
      const response = yield call(insert, payload);
      if (callback) callback(response);
    },
    *modify({ payload, callback }, { call, put }) {
      const response = yield call(modify, payload);
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
};
