import {
  save, deleteOrder, modify, query, get, abort, audit, batchImport, book, finish, getByBillNumbers,
  dailyFinish, receive, getBySourceBillNumberAndDcUuid,copy,pricing,totalPricing,saveAndAudit,getByBillNumberAndDcUuid,previousBill, nextBill
} from '@/services/in/Order';

export default {
  namespace: 'order',
  subscriptions: {
    /**
     * 监听浏览器地址
     * @param dispatch 触发器，用于触发 effects 中的 query 方法
     * @param history 浏览器历史记录，主要用到它的 location 属性以获取地址栏地址
     */
    setup ({ dispatch, history }) {
      history.listen((location) => {
        if(location.payload && location.pathname == "/in/order"){
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
    showPage: 'query'
  },
  effects: {
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
      const response = yield call(saveAndAudit, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPage',
          showPage: 'view',
          entityUuid: response.data
        });
      }
      if (callback) callback(response);
    },
    *delete({ payload, callback }, { call, put }) {
      const response = yield call(deleteOrder, payload);
      if (callback) callback(response)
    },
    *modify({ payload, callback }, { call, put }) {
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
    *abort({ payload, callback }, { call, put }) {
      const response = yield call(abort, payload);
      if (callback) callback(response);
    },
    *audit({ payload, callback }, { call, put }) {
      const response = yield call(audit, payload);
      if (callback) callback(response);
    },
    *book({ payload, callback }, { call, put }) {
      const response = yield call(book, payload);
      if (callback) callback(response);
    },
    *finish({ payload, callback }, { call, put }) {
      const response = yield call(finish, payload);
      if (callback) callback(response);
    },
    *dailyFinish({ payload, callback }, { call, put }) {
      const response = yield call(dailyFinish, payload);
      if (callback) callback(response);
    },
    *receive({ payload, callback }, { call, put }) {
      const response = yield call(receive, payload);
      if (callback) callback(response);
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
    *batchImport({ payload, callback }, { call, put }) {
      const response = yield call(batchImport, payload);
      if (callback) callback(response);
    },
    // *getImportTemplateUrl({ payload, callback }, { call, put }) {
    //   const response = yield call(getImportTemplateUrl, payload);
    //   if (callback) callback(response);
    // },
    *getByBillNumber({ payload, callback }, { call, put }) {
      const response = yield call(getBySourceBillNumberAndDcUuid, payload);
      if (response && response.success) {
        yield put({
          type: 'onView',
          entity: response.data
        });
      }
      if (callback) callback(response);
    },

    *getByBillNumberAndDcUuid({ payload, callback }, { call, put }) {
      const response = yield call(getBySourceBillNumberAndDcUuid, payload);
      if (response && response.success) {
        yield put({
          type: 'onSaveOrder',
          order: response.data
        });
      }
      if (callback) callback(response);
    },

    *getByBillNumberForReceive({ payload,callback }, { call, put }) {
      const response = yield call(getBySourceBillNumberAndDcUuid, payload);
      if (response && response.success) {
        yield put({
          type: 'onView',
          entity: response.data ? response.data : {}
        });
      }
      if (callback) callback(response);

    },
    *getByBillNumberAndDcUuidForBook({ payload,callback }, { call, put }) {
      const response = yield call(getByBillNumberAndDcUuid, payload);
      if (response && response.success) {
        yield put({
          type: 'onSaveOrderAccount',
          orderAccount: response.data ? response.data : {}
        });
      }
      if (callback) callback(response);
    },

    *copy({ payload, callback }, { call, put }) {
      const response = yield call(copy, payload);
      if (callback) callback(response);
    },

    *pricing({ payload, callback }, { call, put }) {
      const response = yield call(pricing, payload);
      if (callback) callback(response);
    },

    *totalPricing({ payload, callback }, { call, put }) {
      const response = yield call(totalPricing, payload);
      if (callback) callback(response);
    },

    *getByBillNumbers({ payload, callback }, { call, put }) {
      const response = yield call(getByBillNumbers, payload);
      if (callback) callback(response);
    },

    *showPage({ payload }, { call, put }) {
      yield put({
        type: 'onShowPage',
        showPage: payload.showPage,
        entityUuid: payload.entityUuid,
        fromView: payload.fromView,
        billNumber: payload.billNumber
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
    onSaveOrder(state, action) {
      return {
        ...state,
        orderEntity: action.order
      }
    },
    onSaveOrderAccount(state, action) {
      return {
        ...state,
        orderAccount: action.orderAccount
      }
    },
    onView(state, action) {
      return {
        ...state,
        entity: action.entity,
        billNumber: action.billNumber
      }
    },
    onShowPage(state, action) {
      return {
        ...state,
        showPage: action.showPage,
        entityUuid: action.entityUuid,
        importTemplateUrl: action.importTemplateUrl,
        fromView: action.fromView,
        billNumber: action.billNumber
      }
    }
  },
}
