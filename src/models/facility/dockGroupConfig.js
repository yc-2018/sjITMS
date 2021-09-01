import { queryByDc, query, remove, save, queryByDcUuid } from '@/services/facility/DockGroupConfig';

export default {
  namespace: 'dockGroupConfig',

  state: {
    data: {
      list: [],
      pagination: {}
    },
    showPage: 'query',
  },

  effects: {
    *queryByDc({ payload, callback }, { call, put }) {
      const response = yield call(queryByDc, payload);
      if (response && response.success) {
        yield put({
          type: 'saveDockGroupConfigList',
          dockGroupConfigList: response.data ? response.data : []
        });
      }
      if (callback) callback(response);
    },
    *queryByDcUuid({ payload, callback }, { call, put }) {
      const response = yield call(queryByDcUuid, payload);
      if (response && response.success) {
        yield put({
          type: 'saveDockGroupConfigList',
          dockGroupConfigList: response.data ? response.data : []
        });
      }
      if (callback) callback(response);
    },

    *query({ payload }, { call, put }) {
      const response = yield call(query, payload);
      if (response && response.success) {
        yield put({
          type: 'onsave',
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

    *remove({ payload, callback }, { call, put }) {
      const response = yield call(remove, payload);
      if (callback) callback(response);
    },

    *save({ payload, callback }, { call, put }) {
      const response = yield call(save, payload);
      if (callback) callback(response);
    },
  },

  reducers: {
    saveDockGroupConfigList(state, action) {
      return {
        ...state,
        dockGroupConfigList: action.dockGroupConfigList
      };
    },

    onsave(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  }
};
