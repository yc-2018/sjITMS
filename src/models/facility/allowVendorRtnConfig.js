import {
  batchSave,
  batchRemove,
  query,
  allowAll,
  forbidAll,
} from '@/services/facility/AllowVendorRtnConfig';

export default {
  namespace: 'allowVendorRtnConfig',

  state: {
    data: {
      list: [],
      pagination: {}
    },
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
    *batchSave({ payload, callback }, { call, put }) {
      const response = yield call(batchSave, payload);
      if (callback) callback(response);
    },
    *batchRemove({ payload, callback }, { call, put }) {
      const response = yield call(batchRemove, payload);
      if (callback) callback(response);
    },
    *allowAll({ payload, callback }, { call, put }) {
      const response = yield call(allowAll, payload);
      if (callback) callback(response);
    },
    *forbidAll({ payload, callback }, { call, put }) {
      const response = yield call(forbidAll, payload);
      if (callback) callback(response);
    },
  },

  reducers: {
    success(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
};