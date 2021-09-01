import {
  save,
  listByDcUuid,
  get,
  remove,
  query
} from '@/services/facility/ContainerTypeBindConfig';

export default {
  namespace: 'containerTypeBindConfig',

  state: {
    data: {},
  },

  effects: {
    *query({ payload }, { call, put }) {
      const response = yield call(query, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
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

    *add({ payload, callback }, { call, put }) {
      const response = yield call(save, payload);
      if (callback) callback(response);
    },

    *listByDcUuid({ payload, callback }, { call, put }) {
      const response = yield call(listByDcUuid, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
          payload: response.data,
          data: response.data,
        });
      }
      if (callback) callback(response);
    },

    *get({ payload, callback }, { call, put }) {
      const response = yield call(get, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
          payload: {
            entity: response.data,
          },
        });
      }
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