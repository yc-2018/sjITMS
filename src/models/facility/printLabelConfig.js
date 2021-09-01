import {
  getByDcUuid,
  insert,
  modify
} from '@/services/facility/PrintLabelConfig';

export default {
  namespace: 'printLabelConfig',

  state: {
    data: {},
  },
  effects: {
    *getByDcUuid({ payload }, { call, put }) {
      const response = yield call(getByDcUuid, payload);
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
