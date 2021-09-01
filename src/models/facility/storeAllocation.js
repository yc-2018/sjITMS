import { save, modify, query, remove, getConfigByStoreUuidAndDcUuid } from '@/services/facility/StoreAllocation';

export default {
  namespace: 'storeAllocateBinConfig',

  state: {
    data: {},
  },

  effects: {
    *query({ payload }, { call, put }) {
      const response = yield call(query, payload);
      if (response && response.success) {
        yield put({
          type: 'success',
          payload: {
            list: response.data.records,
            pagination: {
              total: response.data.paging.recordCount,
              pageSize: response.data.paging.pageSize,
              current: response.data.page + 1,
              showTotal: total => `共 ${total} 条`,
            },
          },
        });
      }
    },
    *save({ payload, callback }, { call, put }) {
      const response = yield call(save, payload);
      if (callback) callback(response);
    },
    *remove({ payload, callback }, { call, put }) {
      const response = yield call(remove, payload);
      if (callback) callback(response);
    },
    *modify({ payload, callback }, { call, put }) {
      const response = yield call(modify, payload);
      if (callback) callback(response);
    },
    *getConfigByStoreUuidAndDcUuid({ payload, callback }, { call, put }) {
      const response = yield call(getConfigByStoreUuidAndDcUuid, payload);
      if (callback) callback(response);
    }
  },

  reducers: {
    success(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  }
};
