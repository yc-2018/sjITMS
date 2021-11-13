import {
  audit, modifyOperate, batchAudit, query, get, pickupStockItem,
  modifyPicker, printLabel, queryElectronicRecord, printElectronicLabel,ownerPrintTemplate, recalculate, getServerDate, getByNumber, queryCrossPrintLabelItem, printCrossLabel,previousBill, nextBill, auditPick, modifyPickUpBill
} from '@/services/out/PickUp';

export default {
  namespace: 'pickup',
  subscriptions: {
    /**
     * 监听浏览器地址
     * @param dispatch 触发器，用于触发 effects 中的 query 方法
     * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
     */
    setup({ dispatch, history }) {
      history.listen((location) => {
        if (location.payload && location.pathname == "/out/pickup") {
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
    *audit({ payload, callback }, { call, put }) {
      const response = yield call(audit, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPage',
          showPage: 'view',
          entityUuid: payload.uuid
        });
      }
      if (callback) callback(response);
    },

    *modifyPickUpBill({ payload, callback }, { call, put }) {
      const response = yield call(modifyPickUpBill, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPage',
          showPage: 'view',
          entityUuid: payload.uuid
        });
      }
      if (callback) callback(response);
    },

    *modifyOperate({ payload, callback }, { call, put }) {
      const response = yield call(modifyOperate, payload);
      if (callback) callback(response);
    },

    *auditPick({ payload, callback }, { call, put }) {
      const response = yield call(auditPick, payload);
      if (callback) callback(response);
    },

    *batchAudit({ payload, callback }, { call, put }) {
      const response = yield call(batchAudit, payload);
      if (callback) callback(response);
    },

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
    *pickupStockItem({ payload, callback }, { call, put }) {
      const response = yield call(pickupStockItem, payload);
      if (response && response.success) {
        yield put({
          type: 'onView',
          entity: response.data
        });
      }
      if (callback) callback(response);
    },
    *modifyPicker({ payload, callback }, { call, put }) {
      const response = yield call(modifyPicker, payload);
      if (callback) callback(response);
    },
    *printLabel({ payload, callback }, { call, put }) {
      const response = yield call(printLabel, payload);
      if (callback) callback(response);
    },
    *ownerPrintTemplate({ payload, callback }, { call, put }) {
      const response = yield call(ownerPrintTemplate, payload);
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
    *queryElectronicRecord({ payload, callback }, { call, put }) {
      const response = yield call(queryElectronicRecord, payload);
      if (response && response.success) {
        yield put({
          type: 'onElectronicList',
          list: response.data ? response.data : []
        });
      }
      if (callback) callback(response);
    },
    *printElectronicLabel({ payload, callback }, { call, put }) {
      const response = yield call(printElectronicLabel, payload);
      if (callback) callback(response);
    },
    *recalculate({ payload, callback }, { call, put }) {
      const response = yield call(recalculate, payload);
      if (callback) callback(response);
    },
    *getServerDate({ payload, callback }, { call, put }) {
      const response = yield call(getServerDate);
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

    *queryCrossPrintLabelItem({ payload, callback }, { call, put }) {
      const response = yield call(queryCrossPrintLabelItem, payload);
      if (response && response.success) {
        yield put({
          type: 'onQueryCrossPrintLabelItem',
          entity: response.data
        });
      }
      if (callback) callback(response);
    },
    *printCrossLabel({ payload, callback }, { call, put }) {
      const response = yield call(printCrossLabel, payload);
      if (callback) callback(response);
    },

    *queryWavePickUp({ payload, callback }, { call, put }) {
      const response = yield call(query, payload);
      if (callback) callback(response);

      if (response && response.success && response.data) {
        yield put({
          type: 'savePickUp',
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
    onQueryCrossPrintLabelItem(state, action) {
      return {
        ...state,
        crossPrintLabelItems: action.entity
      }
    },
    onPrintList(state, action) {
      return {
        ...state,
        printList: action.list
      }
    },
    onElectronicList(state, action) {
      return {
        ...state,
        electronicList: action.list
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
    savePickUp(state, action) {
      return {
        ...state,
        wavePickUpData: action.payload,
      };
    },
  }
}
