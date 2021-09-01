import {
  save, getByCompanyUuid
} from '@/services/tms/TimeIntervalConfig';
export default {
  namespace: 'timeIntervalConfig',

  state: {
    data: {},
  },
  effects: {
    *save({ payload, callback }, { call, put }) {
      const response = yield call(save, payload);
      if (callback) callback(response);
    },
    *getByCompanyUuid({ payload, callback }, { call, put }) {
      const response = yield call(getByCompanyUuid, payload);
      if (response && response.success) {
        yield put({
          type: 'saves',
          payload: {
            entity: response.data,
          },
        });
      }
      if (callback) callback(response);
    },
  },
  reducers: {
    saves(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
};