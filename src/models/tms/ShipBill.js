import {
  query, get, save, modify, abort, audit, remove, queryUnShipItems, pageQueryUnShipItem,
  generateShipBill, queryVirtualUnShipItem, getByBillNumber,queryStockItem, queryUnShipItemsForShip, auditForShip, previousBill, nextBill
} from '@/services/tms/ShipBill';

export default {
  namespace: 'shipbill',
  subscriptions: {
    /**
     * 监听浏览器地址
     * @param dispatch 触发器，用于触发 effects 中的 query 方法
     * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
     */
    setup({ dispatch, history }) {
      history.listen((location) => {
        if (location.payload && location.pathname == "/tms/shipbill") {
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
    unShipItems: [],
    unShipContainerData: {
      list: [],
      pagination: {},
    },

    fromOrgData: {
      list: [],
      pagination: {},
    },

    toOrgData: {
      list: [],
      pagination: {},
    },
    detailAtricleData: {
      list: []
    },
    showPage: 'query'
  },

  effects: {
    *query({ payload, callback }, { call, put }) {
      const response = yield call(query, payload);
      if (response.success) {
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

    *queryUnShipItems({ payload, callback }, { call, put }) {
      const response = yield call(queryUnShipItems, payload);
      if (response && response.success) {
        yield put({
          type: 'saveWaitShipItem',
          payload: response.data
        });
      }
      if (callback) callback(response);
    },
    *queryUnShipItemsForShip({ payload, callback }, { call, put }) {
      const response = yield call(queryUnShipItemsForShip, payload);
      if (response && response.success) {
        yield put({
          type: 'saveWaitShipItem',
          payload: response.data
        });
      }
      if (callback) callback(response);
    },
    *pageQueryUnShipItem({ payload, callback }, { call, put }) {
      const response = yield call(pageQueryUnShipItem, payload);
      if (response.success) {
        yield put({
          type: 'saveUnShipItemData',
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
    },

    *queryVirtualUnShipItem({ payload, callback }, { call, put }) {
      const response = yield call(queryVirtualUnShipItem, payload);
      const type = payload.queryType ? payload.queryType : 'saveUnShipItemData';
      if (response.success) {
        yield put({
          type: type,
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
    },
    *queryStockItem({ payload, callback }, { call, put }) {
      const response = yield call(queryStockItem, payload);
      if (response.success) {
        yield put({
          type: 'saveArticleData',
          payload: {
            list: response.data ? response.data : []
          },
        });
      }
      if (callback) callback(response);
    },

    *get({ payload, callback }, { call, put }) {
      const response = yield call(get, payload);
      yield put({
        type: 'onView',
        payload: response.data
      });
      if (callback) callback(response);
    },

    *previousBill({ payload }, { call, put }) {
      const response = yield call(previousBill, payload);
      yield put({
        type: 'onView',
        payload: response.data
      });
    },

    *nextBill({ payload }, { call, put }) {
      const response = yield call(nextBill, payload);
      yield put({
        type: 'onView',
        payload: response.data
      });
    },

    *getByBillNumber({ payload, callback }, { call, put }) {
      const response = yield call(getByBillNumber, payload);
      if (response.success) {
        yield put({
          type: 'saveEntity',
          payload: response.data
        });
      }
      if (callback) callback(response);
    },

    *onSave({ payload, callback }, { call, put }) {
      const response = yield call(save, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPage',
          showPage: 'view',
          entityUuid: response.data
        });
      }
      if (callback) callback(response);
    },

    *onSaveAndCreate({ payload, callback }, { call, put }) {
      const response = yield call(save, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPage',
          showPage: 'create',
          entityUuid: undefined,
          entity: {}
        });
      }
      if (callback) callback(response);
    },

    *onModify({ payload, callback }, { call, put }) {
      const response = yield call(modify, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPage',
          showPage: 'view',
          entityUuid: payload.uuid
        });
      }
      if (callback) callback(response);
    },

    *onAudit({ payload, callback }, { call, put }) {
      const response = yield call(audit, payload);
      if (callback) callback(response);
    },

    *onAuditForShip({ payload, callback }, { call, put }) {
      const response = yield call(auditForShip, payload);
      if (callback) callback(response);
    },

    *onRemove({ payload, callback }, { call, put }) {
      const response = yield call(remove, payload);
      if (callback) callback(response);
    },

    *onGenerateShipBill({ payload, callback }, { call, put }) {
      const response = yield call(generateShipBill, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPage',
          showPage: 'view',
          entityUuid: response.data
        });
      }
      if (callback) callback(response);
    },

    *showPage({ payload }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: payload.showPage,
        entityUuid: payload.entityUuid,
        fromView: payload.fromView,
      });
    }

  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    saveWaitShipItem(state, action) {
      return {
        ...state,
        unShipItems: action.payload,
      };
    },
    saveUnShipItemData(state, action) {
      return {
        ...state,
        unShipContainerData: action.payload,
      };
    },
    saveArticleData(state, action) {
      return {
        ...state,
        detailAtricleData: action.payload,
      };
    },
    onView(state, action) {
      return {
        ...state,
        entity: action.payload
      }
    },
    onShowPage(state, action) {
      return {
        ...state,
        showPage: action.showPage,
        entityUuid: action.entityUuid,
        entity: {},
        fromView: action.fromView
      }
    },
    showCreatePage(state, action) {
      return {
        ...state,
        entityUuid: undefined,
        entity: action.payload.entity,
        showPage: action.payload.showPage,
      }
    },
    queryFromOrg(state, action) {
      return {
        ...state,
        fromOrgData: action.payload
      };
    },
    queryToOrg(state, action) {
      return {
        ...state,
        toOrgData: action.payload
      };
    },
    saveEntity(state, action) {
      return {
        ...state,
        entity: action.payload,
      };
    },
  },
}
