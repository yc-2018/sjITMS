import { queryAlcntc, queryContainer, confirmSelfHandoverAlcNtc, confirmSelfHandoverContainer } from '@/services/tms/SelfTackShip';

export default {
  namespace: 'selfTackShip',
  state: {
    data: {
      list: [],
      pagination: {},
    },
    entity: {},
    showPage: 'query'
  },
  effects: {
    *queryAlcntc({ payload, callback }, { call, put }) {
      const response = yield call(queryAlcntc, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
          payload: {
            list: response.data.records? response.data.records : [],
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
    *queryContainer({ payload, callback }, { call, put }) {
      const response = yield call(queryContainer, payload);
      if (response && response.success) {
        yield put({
          type: 'save',
          payload: {
            list: response.data.records? response.data.records : [],
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
    *confirmSelfHandoverAlcNtc({ payload, callback }, { call, put }) {
      const response = yield call(confirmSelfHandoverAlcNtc, payload);
      if (callback) callback(response);
    },
    *confirmSelfHandoverContainer({ payload, callback }, { call, put }) {
      const response = yield call(confirmSelfHandoverContainer, payload);
      if (callback) callback(response);
    },
    *showPage({ payload }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: payload.showPage,
        entityUuid: payload.entityUuid,
      });
    },
  },
  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    onShowPage(state, action) {
      return {
        ...state,
        showPage: action.showPage,
        entityUuid: action.entityUuid,
      }
    }
  },
}
