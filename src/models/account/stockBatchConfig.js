import { getByCompanyUuid, saveOrUpdate } from '@/services/facility/StockBatchConfig';

export default {
  namespace: 'stockBatchConfig',

  state: {
    data: []
  },
  effects: {
    *getByCompanyUuid({ payload, callback }, { call, put }) {
      const response = yield call(getByCompanyUuid, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
          value: response.data ? response.data : []
        });
      }
    },
    *saveOrUpdate({ payload, callback }, { call, put }) {
      const response = yield call(saveOrUpdate, payload);
      if (callback) callback(response);
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.value
      };
    },
  },
}