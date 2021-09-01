import { query,get,getByNumber,audit,modifyOperateMethod,modifyPicker,previousBill, nextBill, modifyCrossPickUpBill, auditPick } from '@/services/out/CrossPickUp';

export default {
  namespace: 'crossPickUp',
  subscriptions: {
    /**
     * 监听浏览器地址
     * @param dispatch 触发器，用于触发 effects 中的 query 方法
     * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
     */
    setup({ dispatch, history }) {
      history.listen((location) => {
        if (location.payload && location.pathname == "/out/crossPickUp") {
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
      pagination: {},
    },
    entity: {},
    printList: [],
    electronicList: [],
    showPage: 'query'
  },
  effects: {

    *query({ payload, callback }, { call, put }) {
      const response = yield call(query, payload);
      if (callback) callback(response);

      if (response && response.success) {
        yield put({
          type: 'save',
          payload: {
            list: response.data && response.data.records ? response.data.records : [],
            pagination: {
              total: response.data && response.data.paging.recordCount,
              pageSize: response.data && response.data.paging.pageSize,
              current: response.data && response.data.page + 1,
              showTotal: total => `共 ${total} 条`,
            },
          },
        });
      }
    },
    *get({ payload }, { call, put }) {
      const response = yield call(get, payload);
      if (response && response.success) {
        yield put({
          type: 'onView',
          entity: response.data
        });
      }
    },

    *previousBill({ payload }, { call, put }) {
      const response = yield call(previousBill, payload);
      yield put({
        type: 'onView',
        entity: response.data
      });
    },

    *nextBill({ payload }, { call, put }) {
      const response = yield call(nextBill, payload);
      yield put({
        type: 'onView',
        entity: response.data
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
    *modifyCrossPickUpBill({ payload, callback }, { call, put }) {
      const response = yield call(modifyCrossPickUpBill, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPage',
          showPage: 'view',
          entityUuid: payload.uuid
        });
      }
      if (callback) callback(response);
    },

    *auditCrossPick({ payload, callback }, { call, put }) {
      const response = yield call(audit, payload);
      if (callback) callback(response);
    },
    *modifyOperateMethod({ payload, callback }, { call, put }) {
      const response = yield call(modifyOperateMethod, payload);
      if (callback) callback(response);
    },
    *modifyPicker({ payload, callback }, { call, put }) {
      const response = yield call(modifyPicker, payload);
      if (callback) callback(response);
    },
    *queryPrintRecord({ payload, callback }, { call, put }) {
      const response = yield call(query, payload);
      if (response && response.success) {
        yield put({
          type: 'onPrintList',
          list: response.data && response.data.records ? response.data.records : []
        });
      }
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
  },
  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },

    onPrintList(state, action) {
      return {
        ...state,
        printList: action.list
      }
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
    }
  }
}
