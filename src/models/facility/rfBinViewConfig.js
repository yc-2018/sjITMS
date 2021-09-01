import {
  save, getByCompanyUuidAndDcUuid
} from '@/services/facility/RfBinViewConfig';
export default {
  namespace: 'rfBinViewConfig',

  state: {
    data: {},
  },
  effects: {
    *save({ payload, callback }, { call, put }) {
      const response = yield call(save, payload);
      if (callback) callback(response);
    },
    *getByCompanyUuidAndDcUuid({ payload, callback }, { call, put }) {
      const response = yield call(getByCompanyUuidAndDcUuid, payload);
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