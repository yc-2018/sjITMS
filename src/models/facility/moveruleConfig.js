import { query,getByDCUuidAndFromBinUsage } from '@/services/facility/MoveruleConfig';

export default {
  namespace: 'moveruleConfig',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    entity: {},
    toBinUsages:[],
    showPage: 'query'
  },
  effects: {
    *query({ payload, callback }, { call, put }) {
      const response = yield call(query, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
          payload: {
            list: response.data.records ? response.data.records : [],
            pagination: {
              total: response.data.paging.recordCount,
              pageSize: response.data.paging.pageSize,
              current: response.data.page + 1,
              showTotal: total => `共 ${total} 条`,
            },
          },
        });
      }
      if (callback) callback(response);
    },
    *getByDCUuidAndFromBinUsage({ payload, callback }, { call, put }) {
      const response = yield call(getByDCUuidAndFromBinUsage, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
          toBinUsages: response.data
        });
      }
    }
  },
  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
        toBinUsages:action.toBinUsages
      };
    }
  },
}