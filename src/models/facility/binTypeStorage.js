import {
  save, getByBinTypeUuidAndDcUuid, query, remove
} from '@/services/facility/BinTypeStorage';

export default {
  namespace: 'binTypeStorageConfig',

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
              showTotal: response.data.paging.more ? undefined : total => `共 ${total} 条`,
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
