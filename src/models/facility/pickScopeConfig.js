import {
  query,
  getByDcUuidAndPickerUuid,
  saveOrModify,
  remove
} from '@/services/facility/PickScopeConfig';

export default {
  namespace: 'pickScopeConfig',

  state: {
    data: {
      list:[]
    }
  },

  effects: {
    *query({ payload, callback }, { call, put }) {
      const response = yield call(query, payload);
      if (response && response.success && response.data) {
        yield put({
          type: 'save',
          payload: {
            list: response.data.records ? response.data.records: [],
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
    *getByDcUuidAndPickerUuid({ payload, callback }, { call, put }) {
      const response = yield call(getByDcUuidAndPickerUuid, payload);
      if (response && response.success) {
        yield put({
          type: 'onView',
          payload: response.data ? response.data : [],
        });
      }
    },
    *saveOrModify({ payload, callback }, { call, put }) {
      const response = yield call(saveOrModify, payload);
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
    onView(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
  }
}