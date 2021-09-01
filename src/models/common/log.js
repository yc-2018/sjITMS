import {
  queryEntityLog
} from '@/services/common/Log';

export default {
  namespace: 'log',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },
  effects: {
    *queryEntityLog({ payload, callback }, { call, put }) {
      const response = yield call(queryEntityLog, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
          entityUuid:payload.searchKeyValues.entityUuid,
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
      }else{
        yield put({
          type: 'save',
          entityUuid:payload.searchKeyValues.entityUuid,
          payload: {
            list: [],
            pagination: {},
          },
        });
      }
      if (callback) callback(response);
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
        entityUuid:action.entityUuid,
      };
    },
  },
}