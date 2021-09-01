import {
  saveCollectBinRange,
  queryCollectBin,
  queryCollectBins, queryCollectBinPage,removeDockConfigCollectBinRange
} from '@/services/facility/DockGroupConfig';

export default {
  namespace: 'dockGroupCollectConfig',

  state: {
    data: {
      list: [],
      pagination: {}
    },
    showPage: 'query',
  },

  effects: {
    *saveCollectBinRange({ payload, callback }, { call, put }) {
      const response = yield call(saveCollectBinRange, payload);
      if (callback) callback(response);
    },
    *removeDockConfigCollectBinRange({ payload, callback }, { call, put }) {
      const response = yield call(removeDockConfigCollectBinRange, payload);
      if (callback) callback(response);
    },
    *queryCollectBin({ payload, callback }, { call, put }) {
      const response = yield call(queryCollectBin, payload);
      if (callback) callback(response);
    },
    *queryCollectBins({ payload, callback }, { call, put }) {
      const response = yield call(queryCollectBins, payload);
      if (callback) callback(response);
    },
    *queryCollectBinPage({ payload, callback }, { call, put }) {
      const response = yield call(queryCollectBinPage, payload);
      if (response && response.success) {
        yield put({
          type: 'onsave',
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
      // if (callback) callback(response);
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
