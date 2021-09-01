import {
  query,
  save,
  modify,
  get,
  remove,
  getByCategoryUuidAndDcUuid
} from '@/services/facility/config/CategoryStorageConfig';

export default {
  namespace: 'categoryStorageConfig',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *query({ payload ,callback}, { call, put }) {
      const response = yield call(query, payload);
      if (response && response.success) {
        yield put({
          type: 'success',
          payload: {
            list: response.data && response.data.records ? response.data.records : [],
            pagination: {
              total: response.data && response.data.paging && response.data.paging.recordCount ? response.data.paging.recordCount : 0,
              pageSize: response.data && response.data.paging && response.data.paging.pageSize ? response.data.paging.pageSize : 20,
              current: response.data && response.data.page ? response.data.page + 1 : 1,
              showTotal: total => `共 ${total} 条`,
            },
          },
        });
      }
      if (callback) callback(response);

    },
    *add({ payload, callback }, { call, put }) {
      const response = yield call(save, payload);

      if (callback) callback(response);
    },
    *modify({ payload, callback }, { call, put }) {
      const response = yield call(modify, payload);
      if (callback) callback(response);
    },
    *getByCategoryUuidAndDcUuid({ payload, callback }, { call, put }) {
      const response = yield call(getByCategoryUuidAndDcUuid, payload);
      if (callback) callback(response);
    },
    *get({ payload, callback }, { call, put }) {
      const response = yield call(get, payload);
      if (callback) callback(response);
    },
    *remove({ payload, callback }, { call, put }) {
      const response = yield call(remove, payload);
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
