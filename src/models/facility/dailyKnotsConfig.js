import { getBycompanyUuidAndDcUuid,modify,queryLog } from '@/services/facility/DailyKnotsConfig';

export default {
  namespace: 'dailyKnotsConfig',

  state: {
    data: {
      list: [],
    },
  },

  effects: {
    *onModify({ payload, callback }, { call, put }) {
      const response = yield call(modify, payload);
      if (callback) callback(response);
    },
    *getBycompanyUuidAndDcUuid({ payload, callback }, { call, put }) {
      const response = yield call(getBycompanyUuidAndDcUuid, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
          payload: response.data
        });
      }
    },
    *queryLog({ payload, callback }, { call, put }){
      const response = yield call(queryLog, payload);
      if (response && response.success) {
        yield put({
          type: 'saveDailyLog',
          // payload: response.data
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
    }
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    saveDailyLog(state,action){
      return {
        ...state,
        dailyLog: action.payload,
      };
    }
  }
}
