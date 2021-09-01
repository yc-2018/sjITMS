import {
  query,
  onEditMode,
  get,
  audit,
  batchAudit,
  batchPrint,
  getByNumber,previousBill, nextBill, modifyRplBill
} from '@/services/out/Rpl';

export default {
  namespace: 'rpl',
  subscriptions: {
    /**
     * 监听浏览器地址
     * @param dispatch 触发器，用于触发 effects 中的 query 方法
     * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
     */
    setup({ dispatch, history }) {
      history.listen((location) => {
        if (location.payload && location.pathname == "/out/rpl") {
          dispatch({
            type: 'showPage',
            payload: location.payload,
          })
        }
      });
    },
  },
  state: {
    data: {
      list: [],
      pagination: {}
    },
    showPage: 'query',
    entity: {},
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
            }
          },
        });
      }
      if (callback) callback(response);

    },

    *onEditMode({ payload, callback }, { call, put }) {
      const response = yield call(onEditMode, payload);
      if (callback) callback(response);
    },
    *modifyRplBill({ payload, callback }, { call, put }) {
      const response = yield call(modifyRplBill, payload);
      if (callback) callback(response);
    },
    *get({ payload, callback }, { call, put }) {
      const response = yield call(get, payload);
      if (response && response.success) {
        yield put({
          type: 'onView',
          entity: response.data
        });
      }
      if (callback) callback(response);
    },

    *previousBill({ payload, callback }, { call, put }) {
      const response = yield call(previousBill, payload);
      yield put({
        type: 'onView',
        entity: response.data
      });
      if (callback) callback(response);
    },

    *nextBill({ payload, callback }, { call, put }) {
      const response = yield call(nextBill, payload);
      yield put({
        type: 'onView',
        entity: response.data
      });
      if (callback) callback(response);
    },

    *onAudit({ payload, callback }, { call, put }) {
      const response = yield call(audit, payload);
      if (callback) callback(response);
    },

    *batchAudit({ payload, callback }, { call, put }) {
      const response = yield call(batchAudit, payload);
      if (callback) callback(response);
    },

    *batchPrint({ payload, callback }, { call, put }) {
      const response = yield call(batchPrint, payload);
      if (callback) callback(response);
    },

    *showPage({ payload }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: payload.showPage,
        entityUuid: payload.entityUuid,
        fromView: payload.fromView
      });
    },

    *getByNumber({ payload, callback }, { call, put }) {
      const response = yield call(getByNumber, payload);
      if (response && response.success) {
        yield put({
          type: 'onView',
          entity: response.data
        });
      }
      if (callback) callback(response);
    },

    *queryWaveRpl({ payload, callback }, { call, put }) {
      const response = yield call(query, payload);
      if (response && response.success) {
        yield put({
          type: 'saveRpl',
          payload: {
            list: response.data.records ? response.data.records : [],
            pagination: {
              total: response.data.paging.recordCount,
              pageSize: response.data.paging.pageSize,
              current: response.data.page + 1,
              showTotal: response.data.paging.more ? undefined : total => `共 ${total} 条`,
            }
          },
        });
      }
      if (callback) callback(response);
    }
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
        entity: action.entity
      }
    },
    onShowPage(state, action) {
      return {
        ...state,
        showPage: action.showPage,
        entityUuid: action.entityUuid,
        fromView: action.fromView
      }
    },
    saveRpl(state, action) {
      return {
        ...state,
        waveRplData: action.payload,
      };
    }
  },
};
