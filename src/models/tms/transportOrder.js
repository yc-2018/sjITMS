import {
  save, modify, query, get ,getByBillNumberAndDcUuid, cancel, queryConfirmedOrder, collectCash, initial,batchImport, deleteOrder, split,returnCancel, changeOrderType,
  getReBills,getReShipBills,getWaitResendBills,queryDeliveryBill,getByOrderBillDispatch,batchSave,getExportTemplate,addOrUpdateExportTemplate,batchExportAndDownload,splitOrder
} from '@/services/tms/TransportOrder';
export default {
  namespace: 'transportOrder',
  state: {
    data: {
      list: [],
      pagination: {},
    },
    entity: {},
    showPage: 'query'
  },
  effects: {
    *batchImport({ payload, callback }, { call, put }) {
      const response = yield call(batchImport, payload);
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
    *cancel({ payload, callback }, { call, put }) {
      const response = yield call(cancel, payload);
      if (callback) callback(response);
    },
    *returnCancel({ payload, callback }, { call, put }) {
      const response = yield call(returnCancel, payload);
      if (callback) callback(response);
    },
    *changeOrderType({ payload, callback }, { call, put }) {
      const response = yield call(changeOrderType, payload);
      if (callback) callback(response);
    },
    *queryConfirmedOrder({ payload, callback }, { call, put }) {
      const response = yield call(queryConfirmedOrder, payload);
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
    *collectCash({ payload, callback }, { call, put }) {
      const response = yield call(collectCash, payload);
      if (callback) callback(response);
    },
    *batchSave({ payload, callback }, { call, put }) {
      const response = yield call(batchSave, payload);
      if (callback) callback(response);
    },
    *initial({ payload, callback }, { call, put }) {
      const response = yield call(initial, payload);
      if (callback) callback(response);
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
    *addOrUpdateExportTemplate({ payload, callback }, { call, put }) {
      const response = yield call(addOrUpdateExportTemplate, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPage',
          showPage: 'query',
          entityUuid: response.data
        });
      }
      if (callback) callback(response);
    },
    *batchExportAndDownload({ payload, callback }, { call, put }) {
      const response = yield call(batchExportAndDownload, payload);
      if (callback) callback(response);
    },
    *split({ payload, callback }, { call, put }) {
      const response = yield call(split, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPage',
          showPage: 'view',
          entityUuid: payload.orderUuid
        });
      }
      if (callback) callback(response);
    },
    *splitOrder({ payload, callback }, { call, put }) {
      const response = yield call(splitOrder, payload);
      if (response && response.success) {
        yield put({
          type: 'onShowPage',
          showPage: 'query',
          entityUuid: payload.orderUuid
        });
      }
      if (callback) callback(response);
    },
    *delete({ payload, callback }, { call, put }) {
      const response = yield call(deleteOrder, payload);
      if (callback) callback(response)
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
      if (callback) callback(response)
    },
    *getExportTemplate({ payload, callback }, { call, put }) {
      const response = yield call(getExportTemplate, payload);
      if (response && response.success) {
        yield put({
          type: 'onView',
          entity: response.data
        });
      }
      if (callback) callback(response)
    },
    *getByBillNumberAndDcUuid({ payload, callback }, { call, put }) {
      const response = yield call(getByBillNumberAndDcUuid, payload);
      if (callback) callback(response);
      if (response && response.success) {
        yield put({
          type: 'onView',
          entity: response.data
        });
      }
    },
    *getReBills({ payload, callback }, { call, put }) {
      const response = yield call(getReBills, payload);
      if (callback) callback(response)
    },
    *getReShipBills({ payload, callback }, { call, put }) {
      const response = yield call(getReShipBills, payload);
      if (callback) callback(response)
    },
    *getWaitResendBills({ payload, callback }, { call, put }) {
      const response = yield call(getWaitResendBills, payload);
      if (callback) callback(response)
    },
    *queryDeliveryBill({ payload, callback }, { call, put }) {
      const response = yield call(queryDeliveryBill,  payload.searchKeyValues);
      if (callback) callback(response)
    },
    *getByOrderBillDispatch({ payload, callback }, { call, put }) {
      const response = yield call(getByOrderBillDispatch,  payload.searchKeyValues);
      if (callback) callback(response)
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
        entity: action.entity
      }
    },

    onShowPage(state, action) {
      return {
        ...state,
        showPage: action.showPage,
        entityUuid: action.entityUuid,
        importTemplateUrl: action.importTemplateUrl,
        fromView: action.fromView
      }
    }
  },
}
